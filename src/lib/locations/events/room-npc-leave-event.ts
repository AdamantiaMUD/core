import MudEvent from '../../events/mud-event';

import type Npc from '../../mobs/npc';
import type Room from '../room';

export interface RoomNpcLeavePayload {
    npc: Npc;
    nextRoom: Room;
}

export class RoomNpcLeaveEvent extends MudEvent<RoomNpcLeavePayload> {
    public NAME: string = 'npc-leave';
    public npc: Npc;
    public nextRoom: Room;
}

export default RoomNpcLeaveEvent;
