import Player from '../players/player';
import Room from './room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface RoomPlayerEnterPayload {
    player: Player;
    prevRoom: Room;
}

export const RoomPlayerEnterEvent: MudEventConstructor<RoomPlayerEnterPayload> = class extends MudEvent<RoomPlayerEnterPayload> {
    public NAME: string = 'player-enter';
    public player: Player;
    public prevRoom: Room;
};

export interface RoomPlayerLeavePayload {
    player: Player;
    nextRoom: Room;
}

export const RoomPlayerLeaveEvent: MudEventConstructor<RoomPlayerLeavePayload> = class extends MudEvent<RoomPlayerLeavePayload> {
    public NAME: string = 'player-leave';
    public player: Player;
    public nextRoom: Room;
};
