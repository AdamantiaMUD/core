import Npc from '../mobs/npc';
import Player from '../players/player';
import Room from './room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface RoomNpcEnterPayload {
    npc: Npc;
    prevRoom: Room;
}

export const RoomNpcEnterEvent: MudEventConstructor<RoomNpcEnterPayload> = class extends MudEvent<RoomNpcEnterPayload> {
    public NAME: string = 'npc-enter';
    public npc: Npc;
    public prevRoom: Room;
};

export interface RoomNpcLeavePayload {
    npc: Npc;
    nextRoom: Room;
}

export const RoomNpcLeaveEvent: MudEventConstructor<RoomNpcLeavePayload> = class extends MudEvent<RoomNpcLeavePayload> {
    public NAME: string = 'npc-leave';
    public npc: Npc;
    public nextRoom: Room;
};

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

export const RoomReadyEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'ready';
};

export const RoomSpawnEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'spawn';
};
