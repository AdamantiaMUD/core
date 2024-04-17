import MudEvent from '../../events/mud-event.js';
import type Room from '../../locations/room.js';

export interface NpcEnterRoomPayload {
    nextRoom: Room;
}

export class NpcEnterRoomEvent extends MudEvent<NpcEnterRoomPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'enter-room';
    public nextRoom!: Room;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default NpcEnterRoomEvent;
