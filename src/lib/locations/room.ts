import {hasValue} from '../util/functions.js';
import Logger from '../common/logger.js';
import ScriptableEntity from '../entities/scriptable-entity.js';
import {ItemSpawnEvent} from '../equipment/events/index.js';
import {NpcSpawnEvent} from '../mobs/events/index.js';
import {RoomSpawnEvent} from './events/index.js';
import {clone} from '../util/objects.js';

import type Area from './area.js';
import type Broadcastable from '../communication/broadcastable.js';
import type Door from './door.js';
import type GameStateData from '../game-state-data.js';
import type Item from '../equipment/item.js';
import type Npc from '../mobs/npc.js';
import type Player from '../players/player.js';
import type RoomDefinition from './room-definition.js';
import type RoomEntityDefinition from './room-entity-definition.js';
import type RoomExitDefinition from './room-exit-definition.js';

export class Room extends ScriptableEntity implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _defaultItems: RoomEntityDefinition[];
    private readonly _defaultNpcs: RoomEntityDefinition[];
    private readonly _doors: Map<string, Door> = new Map<string, Door>();
    private readonly _items: Set<Item> = new Set<Item>();
    private readonly _npcs: Set<Npc> = new Set<Npc>();
    private readonly _players: Set<Player> = new Set<Player>();
    private readonly _spawnedNpcs: Set<Npc> = new Set<Npc>();

    public area: Area;
    public def: RoomDefinition;
    public exits: RoomExitDefinition[];
    public id: string;
    public title: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(def: RoomDefinition, area: Area) {
        super(def);

        this._description = def.description;
        this._name = def.title;

        this.area = area;
        this.def = def;
        this.exits = def.exits ?? [];
        this.id = def.id;
        this.title = def.title;

        this._setDoorsFromDef(clone(def.doors ?? {}));

        this._defaultItems = def.items ?? [];
        this._defaultNpcs = def.npcs ?? [];

        super.deserialize({
            metadata: def.metadata ?? null,
            entityReference: `${area.entityReference}:${def.id}`,
        });
    }

    private _setDoorsFromDef(doors: Record<string, Door>): void {
        Object.entries(doors)
            .forEach(([dest, door]: [string, Door]) => {
                this._doors.set(dest, door);
            });
    }

    public get defaultItems(): RoomEntityDefinition[] {
        return this._defaultItems;
    }

    public get defaultNpcs(): RoomEntityDefinition[] {
        return this._defaultNpcs;
    }

    public get doors(): Map<string, Door> {
        return this._doors;
    }

    public get items(): Set<Item> {
        return this._items;
    }

    public get npcs(): Set<Npc> {
        return this._npcs;
    }

    public get players(): Set<Player> {
        return this._players;
    }

    public get spawnedNpcs(): Set<Npc> {
        return this._spawnedNpcs;
    }

    public addItem(item: Item): void {
        this._items.add(item);

        item.setRoom(this);
    }

    public addNpc(npc: Npc): void {
        this._npcs.add(npc);

        npc.setRoom(this);

        this.area.addNpc(npc);
    }

    public addPlayer(player: Player): void {
        this._players.add(player);
    }

    public closeDoor(fromRoom: Room | null = null): void {
        const door = this.getDoor(fromRoom);

        if (!hasValue(door)) {
            return;
        }

        door.closed = true;
    }

    /**
     * Emits event on self and proxies certain events to other entities in the room.
     */
    /*
     * public emit(eventName: string | symbol, ...args: any[]): boolean {
     *     const superReturn = super.emit(eventName, ...args);
     *
     *     const proxiedEvents = [
     *         'npc-enter',
     *         'npc-leave',
     *         'player-enter',
     *         'player-leave',
     *     ];
     *
     *     if (proxiedEvents.includes(eventName as string)) {
     *         const entities = [...this._players];
     *
     *         for (const entity of entities) {
     *             entity.emit(eventName, ...args);
     *         }
     *
     *         return true;
     *     }
     *
     *     return superReturn;
     * }
     */

    /**
     * Get the exit definition of a room's exit by searching the exit name
     */
    public findExit(exitName: string): RoomExitDefinition | null {
        return this.getExits()
            .find((exit: RoomExitDefinition) => exit.direction.startsWith(exitName)) ?? null;
    }

    public getBroadcastTargets(): Player[] {
        return [...this._players];
    }

    public getDoor(fromRoom: Room | null = null): Door | null {
        if (!hasValue(fromRoom) || !hasValue(fromRoom.entityReference)) {
            return null;
        }

        return this._doors.get(fromRoom.entityReference) ?? null;
    }

    public getExits(): RoomExitDefinition[] {
        return clone(this.exits);
    }

    /**
     * Get the exit definition of a room's exit to a given room
     */
    public getExitToRoom(nextRoom: Room): RoomExitDefinition | null {
        return this.getExits()
            .find((exit: RoomExitDefinition) => exit.roomId === nextRoom.entityReference) ?? null;
    }

    /**
     * Check to see if this room has a door preventing movement from `fromRoom` to here
     */
    public hasDoor(fromRoom: Room): boolean {
        return this._doors.has(fromRoom.entityReference);
    }

    public hydrate(state: GameStateData): void {
        super.hydrate(state);

        /**
         * Fires when the room is created but before it has hydrated its default
         * contents. Use the `ready` event if you need default items to be there.
         */
        this.dispatch(new RoomSpawnEvent());

        this._items.clear();

        /*
         * NOTE: This method effectively defines the fact that items/npcs do not
         * persist through reboot unless they're stored on a player.
         * If you would like to change that functionality this is the place
         */

        this._defaultItems.forEach((item: RoomEntityDefinition): void => {
            this.spawnItem(state, item.id);
        });

        this._defaultNpcs.forEach((npc: RoomEntityDefinition): void => {
            this.spawnNpc(state, npc.id);
        });
    }

    /**
     * Check to see of the door for `fromRoom` is locked
     */
    public isDoorLocked(fromRoom: Room | null = null): boolean {
        const door = this.getDoor(fromRoom);

        if (!hasValue(door)) {
            return false;
        }

        return door.locked ?? false;
    }

    public lockDoor(fromRoom: Room | null = null): void {
        const door = this.getDoor(fromRoom);

        if (!hasValue(door)) {
            return;
        }

        this.closeDoor(fromRoom);
        door.locked = true;
    }

    public openDoor(fromRoom: Room | null = null): void {
        const door = this.getDoor(fromRoom);

        if (!hasValue(door)) {
            return;
        }

        door.closed = false;
    }

    public removeItem(item: Item): void {
        this._items.delete(item);
        item.setRoom(null);
    }

    public removeNpc(npc: Npc, removeSpawn: boolean = false): void {
        this._npcs.delete(npc);

        if (removeSpawn) {
            this._spawnedNpcs.delete(npc);
        }

        npc.setRoom(null);
    }

    public removePlayer(player: Player): void {
        this._players.delete(player);
    }

    public resetDoors(): void {
        this._doors.clear();
        this._setDoorsFromDef(clone(this.def.doors ?? {}));
    }

    public spawnItem(state: GameStateData, entityRef: string): Item | null {
        Logger.verbose(`SPAWN: Adding item [${entityRef}] to room [${this.title}]`);

        const newItem = state.itemFactory.create(entityRef, this.area);

        if (hasValue(newItem)) {
            newItem.hydrate(state);
            newItem.sourceRoom = this;

            state.itemManager.add(newItem);

            this.addItem(newItem);

            newItem.dispatch(new ItemSpawnEvent());
        }

        return newItem;
    }

    public spawnNpc(state: GameStateData, entityRef: string): Npc {
        Logger.verbose(`SPAWN: Adding npc [${entityRef}] to room [${this.title}]`);
        const newNpc = state.mobFactory.create(entityRef, this.area);

        newNpc.hydrate(state);
        newNpc.sourceRoom = this;

        this.area.addNpc(newNpc);
        this.addNpc(newNpc);
        this._spawnedNpcs.add(newNpc);

        newNpc.dispatch(new NpcSpawnEvent());

        return newNpc;
    }

    public unlockDoor(fromRoom: Room | null = null): void {
        const door = this.getDoor(fromRoom);

        if (!hasValue(door)) {
            return;
        }

        door.locked = false;
    }
}

export default Room;
