import Character from '../entities/character';
import Effect from '../effects/effect';
import Item from '../equipment/item';
import Room from '../locations/room';
import Skill from '../skills/skill';
import {SimpleMap} from '../../../index';

// @TODO: make this an interface rather than a hard-coded list
export type DamageSource = Character | Effect | Item | Room | Skill;

export class Damage {
    /* eslint-disable lines-between-class-members */
    public amount: number;
    public attacker: Character;
    public attribute: string;
    public metadata: SimpleMap;
    public source: DamageSource;
    /* eslint-enable lines-between-class-members */

    public constructor(
        attribute: string,
        amount: number,
        attacker: Character = null,
        source: DamageSource = null,
        metadata: SimpleMap = {}
    ) {
        if (!Number.isFinite(amount)) {
            throw new TypeError(`Damage amount must be a finite Number, got ${amount}.`);
        }

        this.attacker = attacker;
        this.attribute = attribute;
        this.amount = amount;
        this.source = source;
        this.metadata = metadata;
    }

    /**
     * Actually lower the attribute
     * @fires Character#hit
     * @fires Character#damaged
     */
    public commit(target: Character): void {
        const finalAmount = this.evaluate(target);

        target.lowerAttribute(this.attribute, finalAmount);

        if (this.attacker) {
            /**
             * @event Character#hit
             * @param {Damage} damage
             * @param {Character} target
             * @param {Number} finalAmount
             */
            this.attacker.emit('hit', this, target, finalAmount);
        }

        /**
         * @event Character#damaged
         * @param {Damage} damage
         * @param {Number} finalAmount
         */
        target.emit('damaged', this, finalAmount);
    }

    /**
     * Evaluate actual damage taking attacker/target's effects into account
     */
    public evaluate(target: Character): number {
        let amount = this.amount;

        if (this.attacker) {
            amount = this.attacker.evaluateOutgoingDamage(this, amount);
        }

        return target.evaluateIncomingDamage(this, amount);
    }
}

export default Damage;
