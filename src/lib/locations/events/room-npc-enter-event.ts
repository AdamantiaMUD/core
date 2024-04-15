import MudEvent from '../../events/mud-event.js';

import type Npc from '../../mobs/npc.js';
import type Room from '../room.js';

export interface RoomNpcEnterPayload {
    npc: Npc;
    prevRoom: Room | null;
}

export class RoomNpcEnterEvent extends MudEvent<RoomNpcEnterPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'npc-enter';
    public npc!: Npc;
    public prevRoom!: Room | null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default RoomNpcEnterEvent;
