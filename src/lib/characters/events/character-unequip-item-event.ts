import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';

export interface CharacterUnequipItemPayload {
    item: Item;
    slot: string;
}

export class CharacterUnequipItemEvent extends MudEvent<CharacterUnequipItemPayload> {
    public NAME: string = 'unequip';
    public item: Item;
    public slot: string;
}

export default CharacterUnequipItemEvent;
