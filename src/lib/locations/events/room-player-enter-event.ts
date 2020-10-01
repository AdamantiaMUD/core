import MudEvent from '../../events/mud-event';

import type Player from '../../players/player';
import type Room from '../room';

export interface RoomPlayerEnterPayload {
    player: Player;
    prevRoom: Room;
}

export class RoomPlayerEnterEvent extends MudEvent<RoomPlayerEnterPayload> {
    public NAME: string = 'player-enter';
    public player: Player;
    public prevRoom: Room;
}

export default RoomPlayerEnterEvent;
