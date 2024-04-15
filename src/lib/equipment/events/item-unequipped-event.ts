import MudEvent from '../../events/mud-event.js';

import type Character from '../../characters/character.js';

export interface ItemUnequippedPayload {
    wearer: Character;
}

export class ItemUnequippedEvent extends MudEvent<ItemUnequippedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'unequip';
    public wearer!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default ItemUnequippedEvent;
