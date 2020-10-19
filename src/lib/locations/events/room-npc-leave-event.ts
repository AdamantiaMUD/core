import MudEvent from '../../events/mud-event';

import type Npc from '../../mobs/npc';
import type Room from '../room';

export interface RoomNpcLeavePayload {
    npc: Npc;
    nextRoom: Room;
}

export class RoomNpcLeaveEvent extends MudEvent<RoomNpcLeavePayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'npc-leave';
    public npc: Npc;
    public nextRoom: Room;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomNpcLeaveEvent;
