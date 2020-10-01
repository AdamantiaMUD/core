import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';
import type Damage from '../../combat/damage';

export interface CharacterHitPayload {
    amount: number;
    source: Damage;
    target: CharacterInterface;
}

export class CharacterHitEvent extends MudEvent<CharacterHitPayload> {
    public NAME: string = 'hit';
    public amount: number;
    public source: Damage;
    public target: CharacterInterface;
}

export default CharacterHitEvent;
