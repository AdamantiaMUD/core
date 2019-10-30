import Room from '../locations/room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface NpcEnterRoomPayload {
    nextRoom: Room;
}

export const NpcEnterRoomEvent: MudEventConstructor<NpcEnterRoomPayload> = class extends MudEvent<NpcEnterRoomPayload> {
    public NAME: string = 'enter-room';
    public nextRoom: Room;
};

export const NpcSpawnEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'spawn';
};
