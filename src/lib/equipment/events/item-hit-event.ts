import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';
import type Damage from '../../combat/damage';

export interface ItemHitPayload {
    amount: number;
    source: Damage;
    target: CharacterInterface;
}

export class ItemHitEvent extends MudEvent<ItemHitPayload> {
    public NAME: string = 'item-hit';
    public amount: number;
    public source: Damage;
    public target: CharacterInterface;
}

export default ItemHitEvent;
