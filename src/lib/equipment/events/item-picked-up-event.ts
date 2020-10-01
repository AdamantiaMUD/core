import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface ItemPickedUpPayload {
    character: Character;
}

export class ItemPickedUpEvent extends MudEvent<ItemPickedUpPayload> {
    public NAME: string = 'item-picked-up';
    public character: Character;
}

export default ItemPickedUpEvent;
