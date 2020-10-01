import Logger from '../util/logger';
import ScriptableEntity from '../entities/scriptable-entity';
import {ItemSpawnEvent} from '../equipment/events';
import {NpcSpawnEvent} from '../mobs/events';
import {RoomSpawnEvent} from './events';
import {clone} from '../util/objects';

import type Area from './area';
import type GameStateData from '../game-state-data';
import type Item from '../equipment/item';
import type Npc from '../mobs/npc';
import type Player from '../players/player';
import type {Broadcastable} from '../communication/broadcast';
import type {ScriptableEntityDefinition} from '../entities/scriptable-entity';

export interface Door {
    closed?: boolean;
    locked?: boolean;
    lockedBy?: string;
    oneWay?: boolean;
}

export interface RoomDefinition extends ScriptableEntityDefinition {
    description: string;
    doors?: {[key: string]: Door};
    exits?: RoomExitDefinition[];
    id: string;
    items?: RoomEntityDefinition[];
    npcs?: RoomEntityDefinition[];
    title: string;

    // @TODO: should this be an enum?
    type?: string;
}

export interface RoomEntityDefinition {
    id: string;
    maxLoad?: number;
    replaceOnRespawn?: boolean;
    respawnChance?: number;
}

export interface RoomExitDefinition {

    // @TODO: make directions an enum
    direction: string;
    leaveMessage?: string;
    roomId: string;
}

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
    public description: string;
    public exits: RoomExitDefinition[];
    public id: string;
    public name: string;
    public title: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(def: RoomDefinition, area: Area) {
        super(def);

        this.area = area;
        this.def = def;
        this.description = def.description;
        this.exits = def.exits ?? [];
        this.id = def.id;
        this.name = def.title;
        this.title = def.title;

        this.setDoorsFromDef(clone(def.doors ?? {}));

        this._defaultItems = def.items ?? [];
        this._defaultNpcs = def.npcs ?? [];

        super.deserialize({
            metadata: def.metadata,
            entityReference: `${area.name}:${def.id}`,
        });
    }

    private setDoorsFromDef(doors: {[key: string]: Door}): void {
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
        item.room = this;
    }

    public addNpc(npc: Npc): void {
        this._npcs.add(npc);
        npc.room = this;
        this.area.addNpc(npc);
    }

    public addPlayer(player: Player): void {
        this._players.add(player);
    }

    public closeDoor(fromRoom: Room = null): void {
        const door = this.getDoor(fromRoom);

        if (door === null) {
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
    public findExit(exitName: string): RoomExitDefinition {
        return this.getExits()
            .find(ex => ex.direction.startsWith(exitName));
    }

    public getBroadcastTargets(): Player[] {
        return [...this._players];
    }

    public getDoor(fromRoom: Room = null): Door {
        if (!fromRoom) {
            return null;
        }

        return this._doors.get(fromRoom.entityReference);
    }

    public getExits(): RoomExitDefinition[] {
        return clone(this.exits);
    }

    /**
     * Get the exit definition of a room's exit to a given room
     */
    public getExitToRoom(nextRoom: Room): RoomExitDefinition {
        return this.getExits()
            .find((exit: RoomExitDefinition) => exit.roomId === nextRoom.entityReference);
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
    public isDoorLocked(fromRoom: Room = null): boolean {
        const door = this.getDoor(fromRoom);

        if (door === null) {
            return false;
        }

        return door.locked;
    }

    public lockDoor(fromRoom: Room = null): void {
        const door = this.getDoor(fromRoom);

        if (door === null) {
            return;
        }

        this.closeDoor(fromRoom);
        door.locked = true;
    }

    public openDoor(fromRoom: Room = null): void {
        const door = this.getDoor(fromRoom);

        if (door === null) {
            return;
        }

        door.closed = false;
    }

    public removeItem(item: Item): void {
        this._items.delete(item);
        item.room = null;
    }

    public removeNpc(npc: Npc, removeSpawn: boolean = false): void {
        this._npcs.delete(npc);

        if (removeSpawn) {
            this._spawnedNpcs.delete(npc);
        }

        npc.room = null;
    }

    public removePlayer(player: Player): void {
        this._players.delete(player);
    }

    public resetDoors(): void {
        this._doors.clear();
        this.setDoorsFromDef(clone(this.def.doors ?? {}));
    }

    public spawnItem(state: GameState, entityRef: string): Item {
        Logger.verbose(`SPAWN: Adding item [${entityRef}] to room [${this.title}]`);

        const newItem = state.itemFactory.create(entityRef, this.area);

        newItem.hydrate(state);
        newItem.sourceRoom = this;

        state.itemManager.add(newItem);

        this.addItem(newItem);

        newItem.dispatch(new ItemSpawnEvent());

        return newItem;
    }

    public spawnNpc(state: GameState, entityRef: string): Npc {
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

    public unlockDoor(fromRoom: Room = null): void {
        const door = this.getDoor(fromRoom);

        if (door === null) {
            return;
        }

        door.locked = false;
    }
}

export default Room;
