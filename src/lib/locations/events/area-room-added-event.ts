import MudEvent from '../../events/mud-event';

import type Room from '../room';

export interface AreaRoomAddedPayload {
    room: Room;
}

export class AreaRoomAddedEvent extends MudEvent<AreaRoomAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'room-added';
    public room!: Room;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default AreaRoomAddedEvent;
