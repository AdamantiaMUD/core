import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface ItemUnequippedPayload {
    wearer: Character;
}

export class ItemUnequippedEvent extends MudEvent<ItemUnequippedPayload> {
    public NAME: string = 'unequip';
    public wearer: Character;
}

export default ItemUnequippedEvent;
