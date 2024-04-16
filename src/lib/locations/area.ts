import Logger from '../common/logger.js';
import ScriptableEntity from '../entities/scriptable-entity.js';
import { AreaRoomAddedEvent, RoomReadyEvent } from './events/index.js';
import { UpdateTickEvent } from '../common/events/index.js';
import { hasValue } from '../util/functions.js';

import type AreaManifest from './area-manifest.js';
import type Broadcastable from '../communication/broadcastable.js';
import type GameStateData from '../game-state-data.js';
import type Npc from '../mobs/npc.js';
import type Room from './room.js';

export class Area extends ScriptableEntity implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public readonly bundle: string;

    private readonly _manifest: AreaManifest;

    private readonly _npcs: Set<Npc> = new Set();
    private readonly _rooms: Map<string, Room> = new Map<string, Room>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(bundle: string, ref: string, manifest: AreaManifest) {
        super();

        this._name = manifest.name;

        this.bundle = bundle;
        this.entityReference = ref;

        this._manifest = manifest;

        this.listen(UpdateTickEvent.getName(), this._tickAll.bind(this));
    }

    /**
     * This method is automatically called every N milliseconds where N is
     * defined in the `entityTickFrequency` configuration setting. It, in turn,
     * will fire the `updateTick` event on all its rooms
     */
    private _tickAll(): void {
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

        this.dispatch(new AreaRoomAddedEvent({ room }));
    }

    /**
     * Get all possible broadcast targets within an area. This includes all npcs,
     * players, rooms, and the area itself
     */
    public getBroadcastTargets(): Broadcastable[] {
        const roomTargets = [...this.rooms].reduce(
            (acc: Broadcastable[], [, room]: [string, Room]) =>
                acc.concat(room.getBroadcastTargets()),
            []
        );

        return [this, ...roomTargets];
    }

    public hydrate(state: GameStateData): void {
        Logger.info(`Hydrating area: '${this.name}'`);

        const areaDef = state.areaFactory.getDefinition(this.entityReference);

        if (!hasValue(areaDef)) {
            // @TODO: throw
            return;
        }

        for (const roomRef of areaDef.rooms) {
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
