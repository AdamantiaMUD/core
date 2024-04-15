import MudEvent from '../../events/mud-event.js';

import type Player from '../../players/player.js';
import type Room from '../room.js';

export interface RoomPlayerEnterPayload {
    player: Player;
    prevRoom: Room | null;
}

export class RoomPlayerEnterEvent extends MudEvent<RoomPlayerEnterPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'player-enter';
    public player!: Player;
    public prevRoom!: Room | null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomPlayerEnterEvent;
