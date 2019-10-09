import Character from '../entities/character';
import Damage from './damage';

/**
 * Heal is `Damage` that raises an attribute instead of lowering it
 */
export class Heal extends Damage {
    public commit(target: Character): void {
        const finalAmount = this.evaluate(target);

        target.raiseAttribute(this.attribute, finalAmount);

        if (this.attacker) {
            this.attacker.emit('heal', this, target, finalAmount);
        }

        target.emit('healed', this, finalAmount);
    }
}

export default Heal;
