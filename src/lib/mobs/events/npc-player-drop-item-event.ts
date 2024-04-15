import MudEvent from '../../events/mud-event.js';

import type Item from '../../equipment/item.js';
import type Player from '../../players/player.js';

export interface NpcPlayerDropItemPayload {
    item: Item;
    player: Player;
}

export class NpcPlayerDropItemEvent extends MudEvent<NpcPlayerDropItemPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'player-drop-item';
    public item!: Item;
    public player!: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default NpcPlayerDropItemEvent;
