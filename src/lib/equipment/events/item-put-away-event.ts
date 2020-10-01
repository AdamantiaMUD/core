import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';
import type Item from '../item';

export interface ItemPutAwayPayload {
    character: Character;
    container: Item;
}

export class ItemPutAwayEvent extends MudEvent<ItemPutAwayPayload> {
    public NAME: string = 'put';
    public character: Character;
    public container: Item;
}

export default ItemPutAwayEvent;
