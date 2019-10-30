import Attribute from '../attributes/attribute';
import Character from '../characters/character';
import Damage from '../combat/damage';
import Effect, {SerializedEffect} from './effect';
import Serializable from '../data/serializable';
import {CharacterEffectAddedEvent, CharacterEffectRemovedEvent} from '../characters/character-events';
import {
    EffectStackAddedEvent,
    EffectRefreshedEvent,
    EffectRemoveEvent,
    EffectAddedEvent
} from './effect-events';

/**
 * Self-managing list of effects for a target
 */
export class EffectList implements Serializable {
    private readonly _effects: Set<Effect> = new Set();
    private readonly _target: Character;

    public constructor(target: Character) {
        this._target = target;
    }

    public get size(): number {
        this.validateEffects();

        return this._effects.size;
    }

    /**
     * @param {Effect} effect
     * @fires Effect#effectAdded
     * @fires Effect#effectStackAdded
     * @fires Effect#effectRefreshed
     * @fires Character#effectAdded
     */
    public add(effect: Effect): boolean {
        if (effect.target) {
            throw new Error('Cannot add effect, already has a target.');
        }

        for (const activeEffect of this._effects) {
            if (effect.config.type === activeEffect.config.type) {
                if (activeEffect.config.maxStacks && activeEffect.state.stacks < activeEffect.config.maxStacks) {
                    activeEffect.state.stacks = Math.min(activeEffect.config.maxStacks, activeEffect.state.stacks + 1);

                    activeEffect.dispatch(new EffectStackAddedEvent({effect}));

                    return true;
                }

                if (activeEffect.config.refreshes) {
                    activeEffect.dispatch(new EffectRefreshedEvent({effect}));

                    return true;
                }

                if (activeEffect.config.unique) {
                    return false;
                }
            }
        }

        this._effects.add(effect);
        effect.target = this._target;

        effect.dispatch(new EffectAddedEvent());

        this._target.dispatch(new CharacterEffectAddedEvent({effect}));

        effect.listen(EffectRemoveEvent.getName(), (eff: Effect) => this.remove(eff));

        return true;
    }

    /**
     * Remove all effects, bypassing all deactivate and remove events
     */
    public clear(): void {
        this._effects.clear();
    }

    /**
     * Proxy an event to all effects
     */
    // public emit(event: string | symbol, ...args: any[]): boolean {
    //     this.validateEffects();
    //
    //     if (event === 'effectAdded' || event === 'effectRemoved') {
    //         /*
    //          * don't forward these events on from the player as it would cause
    //          * confusion between Character#effectAdded and Effect#effectAdded.
    //          * The former being when any effect gets added to a character, the
    //          * later is fired on an effect when it is added to a character
    //          */
    //         return false;
    //     }
    //
    //     let hadListeners = false;
    //
    //     for (const effect of this._effects) {
    //         if (!effect.paused && event === 'updateTick' && effect.config.tickInterval) {
    //             const sinceLastTick = Date.now() - effect.state.lastTick;
    //
    //             if (sinceLastTick >= effect.config.tickInterval * 1000) {
    //                 effect.state.lastTick = Date.now();
    //                 effect.state.ticks += 1;
    //             }
    //         }
    //
    //         if (!effect.paused) {
    //             const effectHadListeners = effect.emit(event, ...args);
    //
    //             hadListeners = hadListeners || effectHadListeners;
    //         }
    //     }
    //
    //     return hadListeners;
    // }

    /**
     * Get current list of effects as an array
     */
    public entries(): Effect[] {
        this.validateEffects();

        return [...this._effects];
    }

    /**
     * Gets the effective "max" value of an attribute (before subtracting delta).
     * Does the work of actaully applying attribute modification
     */
    public evaluateAttribute(attr: Attribute): number {
        this.validateEffects();

        const attrName = attr.name;
        let attrValue = attr.base || 0;

        for (const effect of this._effects) {
            if (!effect.paused) {
                attrValue = effect.modifyAttribute(attrName, attrValue);
            }
        }

        return attrValue;
    }

    public evaluateIncomingDamage(damage: Damage, amount: number): number {
        this.validateEffects();

        let currentAmount = amount;

        for (const effect of this._effects) {
            currentAmount = effect.modifyIncomingDamage(damage, currentAmount);
        }

        /*
         * Don't allow a modifier to make damage go negative, it would cause weird
         * behavior where damage raises an attribute
         */
        return Math.max(currentAmount, 0) || 0;
    }

    public evaluateOutgoingDamage(damage: Damage, amount: number): number {
        this.validateEffects();

        let currentAmount = amount;

        for (const effect of this._effects) {
            currentAmount = effect.modifyOutgoingDamage(damage, currentAmount);
        }

        // Same thing, mutatis mutandis, for outgoing damage
        return Math.max(currentAmount, 0) || 0;
    }

    public hasEffectType(type: string): boolean {
        return this.getByType(type) !== undefined;
    }

    public hydrate(state): void {
        const effects = this._effects;

        this._effects.clear();

        for (const newEffect of effects) {
            const effect = state.EffectFactory.create(newEffect.id);

            effect.hydrate(state, newEffect);
            this.add(effect);
        }
    }

    public getByType(type: string): Effect {
        return [...this._effects].find(effect => effect.config.type === type);
    }

    /**
     * Deactivate and remove an effect
     *
     * @throws ReferenceError
     * @fires Character#effectRemoved
     */
    public remove(effect: Effect): void {
        if (!this._effects.has(effect)) {
            throw new ReferenceError('Trying to remove effect that was never added');
        }

        effect.deactivate();
        this._effects.delete(effect);

        this._target.dispatch(new CharacterEffectRemovedEvent({effect}));
    }

    public serialize(): SerializedEffect[] {
        this.validateEffects();

        const serialized = [];

        for (const effect of this._effects) {
            if (effect.config.persists) {
                serialized.push(effect.serialize());
            }
        }

        return serialized;
    }

    /**
     * Ensure effects are still current and if not remove them
     */
    public validateEffects(): void {
        for (const effect of this._effects) {
            if (!effect.isCurrent()) {
                this.remove(effect);
            }
        }
    }
}

export default EffectList;
