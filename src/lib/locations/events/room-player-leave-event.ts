import MudEvent from '../../events/mud-event';

import type Player from '../../players/player';
import type Room from '../room';

export interface RoomPlayerLeavePayload {
    player: Player;
    nextRoom: Room;
}

export class RoomPlayerLeaveEvent extends MudEvent<RoomPlayerLeavePayload> {
    public NAME: string = 'player-leave';
    public player: Player;
    public nextRoom: Room;
}

export default RoomPlayerLeaveEvent;
