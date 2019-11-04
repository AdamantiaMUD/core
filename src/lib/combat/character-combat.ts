import Character from '../characters/character';
import Damage from './damage';
import {
    CombatantAddedEvent,
    CombatantRemovedEvent,
    CombatEndEvent,
    CombatStartEvent,
} from './combat-events';

export class CharacterCombat {
    private readonly _character: Character;
    private readonly _combatants: Set<Character> = new Set();
    private _killed: boolean = false;
    private _killedBy: Character = null;
    private _lag: number = 0;
    private _roundStarted: number = 0;

    constructor(char: Character) {
        this._character = char;
    }

    private reset(): void {
        this._combatants.clear();
        this._killed = false;
        this._killedBy = null;
        this._lag = 0;
        this._roundStarted = 0;
    }

    public get combatants(): Set<Character> {
        return this._combatants;
    }

    public addCombatant(target: Character): void {
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

        this.reset();
    }

    public evaluateIncomingDamage(damage: Damage, currentAmount: number): number {
        return Math.floor(this._character.effects.evaluateIncomingDamage(damage, currentAmount));
    }

    public evaluateOutgoingDamage(damage: Damage, currentAmount: number): number {
        return this._character.effects.evaluateOutgoingDamage(damage, currentAmount);
    }

    public initiate(target: Character, lag: number = 0): void {
        if (!this.isFighting()) {
            this._lag = lag;
            this._roundStarted = Date.now();

            /**
             * Fired when Character#initiateCombat is called
             * @event Character#combatStart
             */
            this._character.dispatch(new CombatStartEvent());
        }

        if (this.isFighting(target)) {
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

    public isFighting(target: Character = null): boolean {
        return target
            ? this._combatants.has(target)
            : this._combatants.size > 0;
    }

    /**
     * @fires Character#combatantRemoved
     * @fires Character#combatEnd
     */
    public removeCombatant(target: Character): void {
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

        if (!this._combatants.size) {
            /**
             * @event Character#combatEnd
             */
            this._character.dispatch(new CombatEndEvent());
        }
    }
}

export default CharacterCombat;
