import Damage from './damage';
import {CharacterHealEvent, CharacterHealedEvent} from '../characters/events';
import {hasValue} from '../util/functions';

import type Character from '../characters/character';

/**
 * Heal is `Damage` that raises an attribute instead of lowering it
 */
export class Heal extends Damage {
    public commit(target: Character): void {
        const finalAmount = this.evaluate(target);

        target.attributes.modify(this.attribute, finalAmount);

        if (hasValue(this.attacker)) {
            this.attacker.dispatch(new CharacterHealEvent({amount: finalAmount, source: this, target: target}));
        }

        target.dispatch(new CharacterHealedEvent({amount: finalAmount, source: this}));
    }
}

export default Heal;
