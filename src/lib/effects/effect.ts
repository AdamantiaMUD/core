import type Ability from '../abilities/ability.js';
import type Character from '../characters/character.js';
import type Damage from '../combat/damage.js';
import MudEventEmitter from '../events/mud-event-emitter.js';
import type GameStateData from '../game-state-data.js';
import { hasValue, isPositiveNumber } from '../util/functions.js';
import { clone } from '../util/objects.js';

import type EffectConfig from './effect-config.js';
import type EffectDefinition from './effect-definition.js';
import type EffectFlag from './effect-flag.js';
import type EffectState from './effect-state.js';
import {
    EffectActivatedEvent,
    EffectAddedEvent,
    EffectDeactivatedEvent,
    EffectRemovedEvent,
} from './events/index.js';
import type { EffectModifiers } from './modifiers/index.js';
import type SerializedEffect from './serialized-effect.js';

export class Effect extends MudEventEmitter {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public ability: Ability | null = null;
    public active: boolean = false;
    public attacker: Character | null = null;
    public config: EffectConfig;
    public flags: EffectFlag[] = [];
    public id: string;
    public modifiers: EffectModifiers;
    public paused: number | null = null;
    public startedAt: number | null = null;
    public state: EffectState;

    private _target: Character | null = null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    // @TODO: not done
    public constructor(id: string, def: EffectDefinition) {
        super();

        this.id = id;
        this.flags = def.flags ?? [];
        this.config = {
            autoActivate: true,
            description: '',
            duration: Infinity,
            hidden: false,
            maxStacks: 0,
            persists: true,
            refreshes: false,
            tickInterval: 0,
            type: 'undef',
            unique: true,
            ...clone(def.config),
        };

        this.modifiers = {
            attributes: {},
            incomingDamage: (
                effect: Effect,
                damage: Damage,
                current: number
            ): number => current,
            outgoingDamage: (
                effect: Effect,
                damage: Damage,
                current: number
            ): number => current,
            ...clone(def.modifiers),
        };

        /*
         * internal state saved across player load e.g., stacks, amount of
         * damage shield remaining, whatever
         * Default state can be found in config.state
         */
        this.state = clone(def.state ?? {});

        if (isPositiveNumber(this.config.maxStacks)) {
            this.state.stacks = 1;
        }

        // If an effect has a tickInterval it should always apply when first activated
        if (
            hasValue(this.config.tickInterval) &&
            !hasValue(this.state.tickInterval)
        ) {
            this.state.lastTick = -Infinity;
            this.state.ticks = 0;
        }

        if (this.config.autoActivate) {
            this.listen(EffectAddedEvent.getName(), this.activate.bind(this));
        }
    }

    public get name(): string {
        return this.config.name;
    }

    public get description(): string {
        return this.config.description ?? this.config.name;
    }

    public get duration(): number {
        return this.config.duration ?? Infinity;
    }

    public set duration(dur: number) {
        this.config.duration = dur;
    }

    /**
     * Elapsed time in milliseconds since event was activated
     */
    public get elapsed(): number {
        if (!hasValue(this.startedAt)) {
            return 0;
        }

        return this.paused ?? Date.now() - this.startedAt;
    }

    /**
     * Remaining time in seconds
     */
    public get remaining(): number {
        return this.duration - this.elapsed;
    }

    public get target(): Character | null {
        return this._target;
    }

    /**
     * Set this effect active
     * @fires Effect#effectActivated
     */
    public activate(): void {
        if (!hasValue(this.target)) {
            throw new Error('Cannot activate an effect without a target');
        }

        if (this.active) {
            return;
        }

        this.startedAt = Date.now() - this.elapsed;

        this.dispatch(new EffectActivatedEvent());
        this.active = true;
    }

    /**
     * Set this effect active
     * @fires Effect#effectDeactivated
     */
    public deactivate(): void {
        if (!this.active) {
            return;
        }

        this.dispatch(new EffectDeactivatedEvent());
        this.active = false;
    }

    public hasTarget(): boolean {
        return this._target !== null;
    }

    /**
     * Reinitialize from persisted data
     */
    public hydrate(state: GameStateData, data: Effect): void {
        this.config = {
            ...data.config,
            duration:
                data.config.duration === -1 ? Infinity : data.config.duration,
        };

        if (hasValue(data.elapsed)) {
            this.startedAt = Date.now() - data.elapsed;
        }

        this.state = {
            ...data.state,
            lastTick: hasValue(data.state.lastTick)
                ? Date.now() - data.state.lastTick
                : data.state.lastTick,
        };

        if (hasValue(data.ability)) {
            this.ability =
                state.skillManager.get(data.ability.id) ??
                state.spellManager.get(data.ability.id);
        }
    }

    /**
     * Whether this effect has lapsed
     */
    public isCurrent(): boolean {
        return this.elapsed < this.duration;
    }

    public modifyAttribute(attrName: string, currentValue: number): number {
        if (typeof this.modifiers.attributes === 'function') {
            return this.modifiers.attributes(this, attrName, currentValue);
        }

        if (
            hasValue(this.modifiers.attributes) &&
            attrName in this.modifiers.attributes
        ) {
            return this.modifiers.attributes[attrName](this, currentValue);
        }

        return currentValue;
    }

    public modifyIncomingDamage(damage: Damage, currentAmount: number): number {
        return (
            this.modifiers.incomingDamage?.(this, damage, currentAmount) ??
            currentAmount
        );
    }

    public modifyOutgoingDamage(damage: Damage, currentAmount: number): number {
        return (
            this.modifiers.outgoingDamage?.(this, damage, currentAmount) ??
            currentAmount
        );
    }

    /**
     * Stop this effect from having any effect temporarily
     */
    public pause(): void {
        this.paused = this.elapsed;
    }

    /**
     * Remove this effect from its target
     * @fires Effect#remove
     */
    public remove(): void {
        /**
         * @event Effect#removed
         */
        this.dispatch(new EffectRemovedEvent());
    }

    /**
     * Resume a paused effect
     */
    public resume(): void {
        if (this.paused === null) {
            return;
        }

        this.startedAt = Date.now() - this.paused;
        this.paused = null;
    }

    /**
     * Gather data to persist
     */
    public serialize(): SerializedEffect {
        const config = clone(this.config);

        config.duration = config.duration === Infinity ? -1 : config.duration;

        const state = clone(this.state);

        /*
         * store lastTick as a difference so we can make sure to start where we
         * left off when we hydrate
         */
        if (hasValue(state.lastTick) && isFinite(state.lastTick)) {
            state.lastTick = Date.now() - state.lastTick;
        }

        return {
            ability: this.ability?.id,
            config: config,
            elapsed: this.elapsed,
            id: this.id,
            remaining: this.remaining,
            state: state,
        };
    }

    public setTarget(target: Character | null): void {
        this._target = target;
    }
}

export default Effect;
