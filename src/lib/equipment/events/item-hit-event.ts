import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';
import type Damage from '../../combat/damage';

export interface ItemHitPayload {
    amount: number;
    source: Damage;
    target: Character;
}

export class ItemHitEvent extends MudEvent<ItemHitPayload> {
    public NAME: string = 'item-hit';
    public amount: number;
    public source: Damage;
    public target: Character;
}

export default ItemHitEvent;
