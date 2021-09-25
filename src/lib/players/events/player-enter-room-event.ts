import MudEvent from '../../events/mud-event';

import type Room from '../../locations/room';

export interface PlayerEnterRoomPayload {
    room: Room;
}

export class PlayerEnterRoomEvent extends MudEvent<PlayerEnterRoomPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'enter-room';
    public room!: Room;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerEnterRoomEvent;
