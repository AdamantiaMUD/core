import {CharacterDamagedEvent, CharacterHitEvent} from '../characters/events';
import {hasValue} from '../util/functions';

import type Ability from '../abilities/ability';
import type Character from '../characters/character';
import type Effect from '../effects/effect';
import type Item from '../equipment/item';
import type Room from '../locations/room';
import type SimpleMap from '../util/simple-map';

// @TODO: make this an interface rather than a hard-coded list
export type DamageSource = Ability | Character | Effect | Item | Room;

export class Damage {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public amount: number;
    public attacker: Character | null;
    public attribute: string;
    public metadata: SimpleMap;
    public source: DamageSource | null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(
        attribute: string,
        amount: number,
        attacker: Character | null = null,
        source: DamageSource | null = null,
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

        target.attributes.modify(this.attribute, -1 * finalAmount);

        if (hasValue(this.attacker)) {
            this.attacker.dispatch(new CharacterHitEvent({amount: finalAmount, source: this, target: target}));
        }

        target.dispatch(new CharacterDamagedEvent({amount: finalAmount, source: this}));
    }

    /**
     * Evaluate actual damage taking attacker/target's effects into account
     */
    public evaluate(target: Character): number {
        let amount = this.amount;

        if (hasValue(this.attacker)) {
            amount = this.attacker.combat.evaluateOutgoingDamage(this, amount);
        }

        return target.combat.evaluateIncomingDamage(this, amount);
    }
}

export default Damage;
