import MudEvent from '../../events/mud-event.js';

import type GameStateData from '../../game-state-data.js';

export interface RoomRespawnTickPayload {
    state?: GameStateData;
}

export class RoomRespawnTickEvent extends MudEvent<RoomRespawnTickPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'room-respawn-tick';
    public state?: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomRespawnTickEvent;
