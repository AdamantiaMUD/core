import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';
import type Damage from '../../combat/damage';

export interface CharacterHitPayload {
    amount: number;
    source: Damage;
    target: CharacterInterface;
}

export class CharacterHitEvent extends MudEvent<CharacterHitPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'hit';
    public amount: number;
    public source: Damage;
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterHitEvent;
