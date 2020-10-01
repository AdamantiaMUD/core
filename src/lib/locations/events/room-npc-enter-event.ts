import MudEvent from '../../events/mud-event';

import type Npc from '../../mobs/npc';
import type Room from '../room';

export interface RoomNpcEnterPayload {
    npc: Npc;
    prevRoom: Room | null;
}

export class RoomNpcEnterEvent extends MudEvent<RoomNpcEnterPayload> {
    public NAME: string = 'npc-enter';
    public npc: Npc;
    public prevRoom: Room | null;
}

export default RoomNpcEnterEvent;
