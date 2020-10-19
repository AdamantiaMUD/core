import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';
import type Item from '../item';

export interface ItemPutAwayPayload {
    character: Character;
    container: Item;
}

export class ItemPutAwayEvent extends MudEvent<ItemPutAwayPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'put';
    public character: Character;
    public container: Item;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemPutAwayEvent;
