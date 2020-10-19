import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';
import type Damage from '../../combat/damage';

export interface ItemHitPayload {
    amount: number;
    source: Damage;
    target: CharacterInterface;
}

export class ItemHitEvent extends MudEvent<ItemHitPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'item-hit';
    public amount: number;
    public source: Damage;
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemHitEvent;
