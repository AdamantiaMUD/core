import MudEvent from '../../events/mud-event';

import type Item from '../../equipment/item';
import type Player from '../../players/player';

export interface NpcPlayerDropItemPayload {
    item: Item;
    player: Player;
}

export class NpcPlayerDropItemEvent extends MudEvent<NpcPlayerDropItemPayload> {
    public NAME: string = 'player-drop-item';
    public item: Item;
    public player: Player;
}

export default NpcPlayerDropItemEvent;
