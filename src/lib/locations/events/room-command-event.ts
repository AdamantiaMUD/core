import MudEvent from '../../events/mud-event.js';
import type Player from '../../players/player.js';

export interface RoomCommandPayload {
    args?: string;
    name: string;
    player: Player;
}

export class RoomCommandEvent extends MudEvent<RoomCommandPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'room-command';
    public args?: string;
    public name!: string;
    public player!: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomCommandEvent;
