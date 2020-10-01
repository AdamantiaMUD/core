import MudEvent from '../../events/mud-event';

import type Player from '../../players/player';

export interface RoomCommandPayload {
    args?: string;
    name: string;
    player: Player;
}

export class RoomCommandEvent extends MudEvent<RoomCommandPayload> {
    public NAME: string = 'room-command';
    public args?: string;
    public name: string;
    public player: Player;
}

export default RoomCommandEvent;
