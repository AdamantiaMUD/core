import MudEvent from '../../events/mud-event';

import type GameStateData from '../../game-state-data';

export interface RoomRespawnTickPayload {
    state?: GameStateData;
}

export class RoomRespawnTickEvent extends MudEvent<RoomRespawnTickPayload> {
    public NAME: string = 'room-respawn-tick';
    public state?: GameStateData;
}

export default RoomRespawnTickEvent;
