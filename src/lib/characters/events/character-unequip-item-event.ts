import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';

export interface CharacterUnequipItemPayload {
    item: Item;
    slot: string;
}

export class CharacterUnequipItemEvent extends MudEvent<CharacterUnequipItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'unequip';
    public item!: Item;
    public slot!: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterUnequipItemEvent;
