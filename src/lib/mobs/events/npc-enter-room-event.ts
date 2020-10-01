import MudEvent from '../../events/mud-event';

import type Room from '../../locations/room';

export interface NpcEnterRoomPayload {
    nextRoom: Room;
}

export class NpcEnterRoomEvent extends MudEvent<NpcEnterRoomPayload> {
    public NAME: string = 'enter-room';
    public nextRoom: Room;
}

export default NpcEnterRoomEvent;
