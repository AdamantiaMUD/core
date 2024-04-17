import MudEvent from '../../events/mud-event.js';
import type Player from '../../players/player.js';
import type Room from '../room.js';

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
