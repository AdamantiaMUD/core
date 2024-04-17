import type Damage from '../../combat/damage.js';
import MudEvent from '../../events/mud-event.js';
import type Character from '../character.js';

export interface CharacterHitPayload {
    amount: number;
    source: Damage;
    target: Character;
}

export class CharacterHitEvent extends MudEvent<CharacterHitPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'hit';
    public amount!: number;
    public source!: Damage;
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterHitEvent;
