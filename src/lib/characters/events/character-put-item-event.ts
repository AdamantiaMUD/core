import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';

export interface CharacterPutItemPayload {
    container: Item;
    item: Item;
}

export class CharacterPutItemEvent extends MudEvent<CharacterPutItemPayload> {
    public NAME: string = 'put';
    public container: Item;
    public item: Item;
}

export default CharacterPutItemEvent;
