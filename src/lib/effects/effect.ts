import EventEmitter from 'events';
import cloneFactory from 'rfdc';

import Ability from '../abilities/ability';
import Character from '../entities/character';
import Damage from '../combat/damage';
import EffectFlag from './effect-flag';
import GameState from '../game-state';
import Serializable from '../data/serializable';
import SimpleMap from '../util/simple-map';
import {EffectModifiers} from './effect-modifiers';

export interface EffectConfig {
    autoActivate?: boolean;
    description?: string;
    duration?: number;
    hidden?: boolean;
    maxStacks?: number;
    name: string;
    persists?: boolean;
    refreshes?: boolean;
    tickInterval?: number;
    type?: string;
    unique?: boolean;
}

export interface EffectState {
    lastTick?: number;
    stacks?: number;
    tickInterval?: number;
    ticks?: number;
    [key: string]: any;
}

export interface SerializedEffect extends SimpleMap {
    ability?: string;
    config: EffectConfig;
    elapsed: number;
    id: string;
    remaining: number;
    state: EffectState;
}

const clone = cloneFactory();

/**
 * See the {@link http://ranviermud.com/extending/effects/|Effect guide} for usage.
 * @property {object}  config Effect configuration (name/desc/duration/etc.)
 * @property {boolean} config.autoActivate If this effect immediately activates itself when added to the target
 * @property {boolean} config.hidden       If this effect is shown in the character's effect list
 * @property {boolean} config.refreshes    If an effect with the same type is applied it will trigger an effectRefresh
 *   event instead of applying the additional effect.
 * @property {boolean} config.unique       If multiple effects with the same `config.type` can be applied at once
 * @property {number}  config.maxStacks    When adding an effect of the same type it adds a stack to the current
 *     effect up to maxStacks instead of adding the effect. Implies `config.unique`
 * @property {boolean} config.persists     If false the effect will not save to the player
 * @property {string}  config.type         The effect category, mainly used when disallowing stacking
 * @property {boolean|number} config.tickInterval Number of seconds between calls to the `updateTick` listener
 * @property {string}    description
 * @property {object}    state  Configuration of this _type_ of effect (magnitude, element, stat, etc.)
 *
 * @listens Effect#effectAdded
 */
export class Effect extends EventEmitter implements Serializable {
    /* eslint-disable lines-between-class-members */
    public ability: Ability = null;
    public active: boolean;
    public attacker: Character = null;
    public config: EffectConfig;
    public flags: EffectFlag[] = [];
    public id: string;
    public modifiers: EffectModifiers;
    public paused: number = 0;
    public startedAt: number = 0;
    public state: EffectState;
    public target: Character;
    /* eslint-enable lines-between-class-members */

    // @TODO: not done
    public constructor(id, def) {
        super();

        this.id = id;
        this.flags = def.flags || [];
        this.config = {
            autoActivate: true,
            description: '',
            duration: Infinity,
            hidden: false,
            maxStacks: 0,
            name: 'Unnamed Effect',
            persists: true,
            refreshes: false,
            tickInterval: 0,
            type: 'undef',
            unique: true,
            ...clone(def.config),
        };

        this.modifiers = {
            attributes: {},
            incomingDamage: (effect, damage, current) => current,
            outgoingDamage: (effect, damage, current) => current,
            ...clone(def.modifiers),
        };

        /*
         * internal state saved across player load e.g., stacks, amount of
         * damage shield remaining, whatever
         * Default state can be found in config.state
         */
        this.state = clone(def.state);

        if (this.config.maxStacks) {
            this.state.stacks = 1;
        }

        // If an effect has a tickInterval it should always apply when first activated
        if (this.config.tickInterval && !this.state.tickInterval) {
            this.state.lastTick = -Infinity;
            this.state.ticks = 0;
        }

        if (this.config.autoActivate) {
            this.on('effect-added', this.activate);
        }
    }

    public get name(): string {
        return this.config.name;
    }

    public get description(): string {
        return this.config.description;
    }

    public get duration(): number {
        return this.config.duration;
    }

    public set duration(dur: number) {
        this.config.duration = dur;
    }

    /**
     * Elapsed time in milliseconds since event was activated
     */
    public get elapsed(): number {
        if (!this.startedAt) {
            return null;
        }

        return this.paused || (Date.now() - this.startedAt);
    }

    /**
     * Remaining time in seconds
     */
    public get remaining(): number {
        return this.config.duration - this.elapsed;
    }

    /**
     * Set this effect active
     * @fires Effect#effectActivated
     */
    public activate(): void {
        if (!this.target) {
            throw new Error('Cannot activate an effect without a target');
        }

        if (this.active) {
            return;
        }

        this.startedAt = Date.now() - this.elapsed;

        /**
         * @event Effect#effectActivated
         */
        this.emit('effect-activated');
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

        /**
         * @event Effect#effectDeactivated
         */
        this.emit('effect-deactivated');
        this.active = false;
    }

    /**
     * Reinitialize from persisted data
     */
    public hydrate(state: GameState, data: any): void {
        data.config.duration = data.config.duration === -1 ? Infinity : data.config.duration;

        this.config = data.config;

        if (!isNaN(data.elapsed)) {
            this.startedAt = Date.now() - data.elapsed;
        }

        if (!isNaN(data.state.lastTick)) {
            data.state.lastTick = Date.now() - data.state.lastTick;
        }
        this.state = data.state;

        if (data.ability) {
            this.ability = state.skillManager.get(data.ability) || state.spellManager.get(data.ability);
        }
    }

    /**
     * Whether this effect has lapsed
     */
    public isCurrent(): boolean {
        return this.elapsed < this.config.duration;
    }

    public modifyAttribute(attrName: string, currentValue: number): number {
        if (typeof this.modifiers.attributes === 'function') {
            return this.modifiers.attributes(this, attrName, currentValue);
        }

        if (attrName in this.modifiers.attributes) {
            return this.modifiers.attributes[attrName](this, currentValue);
        }

        return currentValue;
    }

    public modifyIncomingDamage(damage: Damage, currentAmount: number): number {
        return this.modifiers.incomingDamage(this, damage, currentAmount);
    }

    public modifyOutgoingDamage(damage: Damage, currentAmount: number): number {
        return this.modifiers.outgoingDamage(this, damage, currentAmount);
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
         * @event Effect#remove
         */
        this.emit('remove');
    }

    /**
     * Resume a paused effect
     */
    public resume(): void {
        this.startedAt = Date.now() - this.paused;
        this.paused = null;
    }

    /**
     * Gather data to persist
     * @return {Object}
     */
    public serialize(): SerializedEffect {
        const config = clone(this.config);

        config.duration = config.duration === Infinity ? -1 : config.duration;

        const state = clone(this.state);

        /*
         * store lastTick as a difference so we can make sure to start where we
         * left off when we hydrate
         */
        if (state.lastTick && isFinite(state.lastTick)) {
            state.lastTick = Date.now() - state.lastTick;
        }

        return {
            ability: this.ability && this.ability.id,
            config: config,
            elapsed: this.elapsed,
            id: this.id,
            remaining: this.remaining,
            state: state,
        };
    }
}

export default Effect;
