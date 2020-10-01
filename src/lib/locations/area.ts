import ScriptableEntity from '../entities/scriptable-entity';
import {AreaRoomAddedEvent, RoomReadyEvent} from './events';
import {UpdateTickEvent} from '../common/common-events';

import type GameStateData from '../game-state-data';
import type Npc from '../mobs/npc';
import type Player from '../players/player';
import type Room from './room';
import type SimpleMap from '../util/simple-map';
import type {Broadcastable} from '../communication/broadcast';
import type {ScriptableEntityDefinition} from '../entities/scriptable-entity';

export interface AreaDefinition extends ScriptableEntityDefinition {
    bundle: string;
    manifest: AreaManifest;
    npcs: string[];
    quests: string[];
    rooms: string[];
}

export interface AreaManifest {
    metadata?: SimpleMap;
    name: string;
}

export class Area extends ScriptableEntity implements Broadcastable {
    public readonly name: string;
    public readonly bundle: string;

    private readonly _manifest: AreaManifest;

    private readonly _npcs: Set<Npc> = new Set();
    private readonly _rooms: Map<string, Room> = new Map();

    public constructor(bundle: string, ref: string, manifest: AreaManifest) {
        super();

        this.bundle = bundle;
        this.entityReference = ref;
        this.name = manifest.name;

        this._manifest = manifest;

        this.listen(UpdateTickEvent.getName(), this.tickAll.bind(this));
    }

    /**
     * This method is automatically called every N milliseconds where N is
     * defined in the `entityTickFrequency` configuration setting. It, in turn,
     * will fire the `updateTick` event on all its rooms
     */
    private tickAll(): void {
        for (const [, room] of this.rooms) {
            room.dispatch(new UpdateTickEvent());
        }
    }

    public get npcs(): Set<Npc> {
        return this._npcs;
    }

    public get rooms(): Map<string, Room> {
        return this._rooms;
    }

    public addNpc(npc: Npc): void {
        this._npcs.add(npc);
    }

    public addRoom(room: Room): void {
        this.rooms.set(room.id, room);

        this.dispatch(new AreaRoomAddedEvent({room}));
    }

    /**
     * Get all possible broadcast targets within an area. This includes all npcs,
     * players, rooms, and the area itself
     */
    public getBroadcastTargets(): Player[] {
        const roomTargets = [...this.rooms].reduce(
            (acc, [, room]) => acc.concat(room.getBroadcastTargets()),
            []
        );

        return [this, ...roomTargets];
    }

    public hydrate(state: GameStateData): void {
        const {rooms} = state.areaFactory.getDefinition(this.name);

        for (const roomRef of rooms) {
            const room = state.roomFactory.create(roomRef, this);

            this.addRoom(room);
            state.roomManager.addRoom(room);
            room.hydrate(state);

            /**
             * Fires after the room is hydrated and added to its area
             */
            room.dispatch(new RoomReadyEvent());
        }
    }

    /**
     * Removes an NPC from the area. NOTE: This must manually remove the NPC from its room as well
     */
    public removeNpc(npc: Npc): void {
        this._npcs.delete(npc);
    }
}

export default Area;
