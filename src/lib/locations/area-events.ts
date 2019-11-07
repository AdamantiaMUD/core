import Room from './room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface AreaRoomAddedPayload {
    room: Room;
}

export const AreaRoomAddedEvent: MudEventConstructor<AreaRoomAddedPayload> = class extends MudEvent<AreaRoomAddedPayload> {
    public NAME: string = 'room-added';
    public room: Room;
};
