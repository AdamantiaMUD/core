import MudEvent from '../../events/mud-event.js';

import type Item from '../../equipment/item.js';

export interface CharacterPutItemPayload {
    container: Item;
    item: Item;
}

export class CharacterPutItemEvent extends MudEvent<CharacterPutItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'put';
    public container!: Item;
    public item!: Item;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterPutItemEvent;
