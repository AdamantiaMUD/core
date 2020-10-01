import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';

export interface CharacterEquipItemPayload {
    item: Item;
    slot: string;
}

export class CharacterEquipItemEvent extends MudEvent<CharacterEquipItemPayload> {
    public NAME: string = 'equip';
    public item: Item;
    public slot: string;
}

export default CharacterEquipItemEvent;
