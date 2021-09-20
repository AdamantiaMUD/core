import MudEvent from '../../events/mud-event';

import type Player from '../../players/player';
import type Room from '../room';

export interface RoomPlayerLeavePayload {
    player: Player;
    nextRoom: Room;
}

export class RoomPlayerLeaveEvent extends MudEvent<RoomPlayerLeavePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'player-leave';
    public player!: Player;
    public nextRoom!: Room;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomPlayerLeaveEvent;
