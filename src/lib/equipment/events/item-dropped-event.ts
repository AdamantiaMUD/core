import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface ItemDroppedPayload {
    character: Character;
}

export class ItemDroppedEvent extends MudEvent<ItemDroppedPayload> {
    public NAME: string = 'item-dropped';
    public character: Character;
}

export default ItemDroppedEvent;
