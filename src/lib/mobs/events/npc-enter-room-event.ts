import MudEvent from '../../events/mud-event';

import type Room from '../../locations/room';

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
