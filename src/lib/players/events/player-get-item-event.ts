import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';

export interface PlayerGetItemPayload {
    item: Item;
}

export class PlayerGetItemEvent extends MudEvent<PlayerGetItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'get';
    public item: Item;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerGetItemEvent;
