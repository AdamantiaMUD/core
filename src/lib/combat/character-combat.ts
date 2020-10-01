import {hasValue} from '../util/functions';
import {
    CombatantAddedEvent,
    CombatantRemovedEvent,
    CombatEndEvent,
    CombatStartEvent,
} from './events';

import type CharacterInterface from '../characters/character-interface';
import type Damage from './damage';

export class CharacterCombat {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _character: CharacterInterface;
    private readonly _combatants: Set<CharacterInterface> = new Set();
    private _killed: boolean = false;
    private _killedBy: CharacterInterface | null = null;
    private _lag: number = 0;
    private _roundStarted: number = 0;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(char: CharacterInterface) {
        this._character = char;
    }

    private _reset(): void {
        this._combatants.clear();
        this._killed = false;
        this._killedBy = null;
        this._lag = 0;
        this._roundStarted = 0;
    }

    public get combatants(): Set<CharacterInterface> {
        return this._combatants;
    }

    public addCombatant(target: CharacterInterface): void {
        if (this.isFighting(target)) {
            return;
        }

        this._combatants.add(target);
        target.combat.addCombatant(this._character);

        /**
         * @event Character#combatantAdded
         * @param {Character} target
         */
        this._character.dispatch(new CombatantAddedEvent({target}));
    }

    /**
     * Fully remove this character from combat
     */
    public disengage(): void {
        if (!this.isFighting()) {
            return;
        }

        for (const combatant of this._combatants) {
            this.removeCombatant(combatant);
        }

        this._reset();
    }

    public evaluateIncomingDamage(damage: Damage, currentAmount: number): number {
        return Math.floor(this._character.effects.evaluateIncomingDamage(damage, currentAmount));
    }

    public evaluateOutgoingDamage(damage: Damage, currentAmount: number): number {
        return this._character.effects.evaluateOutgoingDamage(damage, currentAmount);
    }

    public initiate(target: CharacterInterface | null, lag: number = 0): void {
        if (!this.isFighting()) {
            this._lag = lag;
            this._roundStarted = Date.now();

            /**
             * Fired when Character#initiateCombat is called
             * @event Character#combatStart
             */
            this._character.dispatch(new CombatStartEvent());
        }

        if (this.isFighting(target) || !hasValue(target)) {
            return;
        }

        /*
         * this doesn't use `addCombatant` because `addCombatant` automatically
         * adds this to the target's combatants list as well
         */
        this._combatants.add(target);
        if (!target.combat.isFighting()) {
            // @TODO: This hardcoded 2.5 second lag on the target needs to be refactored
            target.combat.initiate(this._character, 2500);
        }

        target.combat.addCombatant(this._character);
    }

    public isFighting(target: CharacterInterface | null = null): boolean {
        return hasValue(target)
            ? this._combatants.has(target)
            : this._combatants.size > 0;
    }

    /**
     * @fires Character#combatantRemoved
     * @fires Character#combatEnd
     */
    public removeCombatant(target: CharacterInterface): void {
        if (!this._combatants.has(target)) {
            return;
        }

        this._combatants.delete(target);
        target.combat.removeCombatant(this._character);

        /**
         * @event Character#combatantRemoved
         * @param {Character} target
         */
        this._character.dispatch(new CombatantRemovedEvent({target}));

        if (this._combatants.size === 0) {
            /**
             * @event Character#combatEnd
             */
            this._character.dispatch(new CombatEndEvent());
        }
    }
}

export default CharacterCombat;
