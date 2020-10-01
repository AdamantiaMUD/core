import MudEvent from '../../events/mud-event';

import type Room from '../room';

export interface AreaRoomAddedPayload {
    room: Room;
}

export class AreaRoomAddedEvent extends MudEvent<AreaRoomAddedPayload> {
    public NAME: string = 'room-added';
    public room: Room;
}

export default AreaRoomAddedEvent;
