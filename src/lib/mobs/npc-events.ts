import Item from '../equipment/item';
import Player from '../players/player';
import Room from '../locations/room';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface NpcEnterRoomPayload {
    nextRoom: Room;
}

export const NpcEnterRoomEvent: MudEventConstructor<NpcEnterRoomPayload> = class extends MudEvent<NpcEnterRoomPayload> {
    public NAME: string = 'enter-room';
    public nextRoom: Room;
};

export interface NpcPlayerDropItemPayload {
    item: Item;
    player: Player;
}

export const NpcPlayerDropItemEvent: MudEventConstructor<NpcPlayerDropItemPayload> = class extends MudEvent<NpcPlayerDropItemPayload> {
    public NAME: string = 'player-drop-item';
    public item: Item;
    public player: Player;
};

export const NpcSpawnEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'spawn';
};
