import MudEvent from '../../events/mud-event.js';

import type Item from '../../equipment/item.js';

export interface PlayerDropItemPayload {
    item: Item;
}

export class PlayerDropItemEvent extends MudEvent<PlayerDropItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'drop';
    public item!: Item;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerDropItemEvent;
