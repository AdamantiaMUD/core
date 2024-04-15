import MudEvent from '../../events/mud-event.js';

import type Character from '../../characters/character.js';
import type Item from '../item.js';

export interface ItemPutAwayPayload {
    character: Character;
    container: Item;
}

export class ItemPutAwayEvent extends MudEvent<ItemPutAwayPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'put';
    public character!: Character;
    public container!: Item;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemPutAwayEvent;
