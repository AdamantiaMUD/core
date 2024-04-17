import type Character from '../../characters/character.js';
import type Damage from '../../combat/damage.js';
import MudEvent from '../../events/mud-event.js';

export interface ItemHitPayload {
    amount: number;
    source: Damage;
    target: Character;
}

export class ItemHitEvent extends MudEvent<ItemHitPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'item-hit';
    public amount!: number;
    public source!: Damage;
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemHitEvent;
