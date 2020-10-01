import MudEvent from '../../events/mud-event';

import type Character from '../../characters/character';

export interface ItemEquippedPayload {
    wearer: Character;
}

export class ItemEquippedEvent extends MudEvent<ItemEquippedPayload> {
    public NAME: string = 'equip';
    public wearer: Character;
}

export default ItemEquippedEvent;
