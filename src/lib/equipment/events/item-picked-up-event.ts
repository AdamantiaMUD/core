import MudEvent from '../../events/mud-event.js';

import type Character from '../../characters/character.js';

export interface ItemPickedUpPayload {
    character: Character;
}

export class ItemPickedUpEvent extends MudEvent<ItemPickedUpPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'item-picked-up';
    public character!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemPickedUpEvent;
