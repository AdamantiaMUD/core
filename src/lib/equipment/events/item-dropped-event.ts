import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface ItemDroppedPayload {
    character: Character;
}

export class ItemDroppedEvent extends MudEvent<ItemDroppedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'item-dropped';
    public character: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemDroppedEvent;
