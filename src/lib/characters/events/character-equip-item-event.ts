import type Item from '../../equipment/item.js';
import MudEvent from '../../events/mud-event.js';

export interface CharacterEquipItemPayload {
    item: Item;
    slot: string;
}

export class CharacterEquipItemEvent extends MudEvent<CharacterEquipItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'equip';
    public item!: Item;
    public slot!: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterEquipItemEvent;
