import cloneFactory from 'rfdc';

import Area from './area';
import GameState from '../game-state';
import Item from '../equipment/item';
import Logger from '../util/logger';
import Npc from '../mobs/npc';
import Player from '../players/player';
import ScriptableEntity, {ScriptableEntityDefinition} from '../entities/scriptable-entity';
import {Broadcastable} from '../communication/broadcast';
import {SimpleMap} from '../../../index';

const clone = cloneFactory();

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
    private readonly _defaultItems: RoomEntityDefinition[];
    private readonly _defaultNpcs: RoomEntityDefinition[];
    private readonly _doors: Map<string, Door> = new Map();
    private readonly _npcs: Set<Npc> = new Set();
    private readonly _players: Set<Player> = new Set();
    private readonly _spawnedNpcs: Set<Npc> = new Set();

    public area: Area;
    public def: RoomDefinition;
    public description: string;
    public exits: RoomExitDefinition[];
    public id: string;
    public items: Set<Item> = new Set();
    public name: string;
    public title: string;

    public constructor(def: RoomDefinition, area: Area) {
        super(def);

        this.area = area;
        this.def = def;
        this.description = def.description;
        this.exits = def.exits || [];
        this.id = def.id;
        this.name = def.title;
        this.title = def.title;

        const doors: {[key: string]: Door} = clone(def.doors ?? {});
        Object.entries(doors)
            .forEach(([dest, door]: [string, Door]) => {
                this._doors.set(dest, door);
            });

        this._defaultItems = def.items ?? [];
        this._defaultNpcs = def.npcs ?? [];

        super.deserialize({
            metadata: def.metadata,
            entityReference: `${area.name}:${def.id}`,
        });
    }

    public get npcs(): Set<Npc> {
        return this._npcs;
    }

    public get players(): Set<Player> {
        return this._players;
    }

    public addItem(item: Item): void {
        this.items.add(item);
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
    public emit(eventName: string | symbol, ...args: any[]): boolean {
        const superReturn = super.emit(eventName, ...args);

        const proxiedEvents = [
            'npc-enter',
            'npc-leave',
            'player-enter',
            'player-leave',
        ];

        if (proxiedEvents.includes(eventName as string)) {
            const entities = [...this._players];

            for (const entity of entities) {
                entity.emit(eventName, ...args);
            }

            return true;
        }

        return superReturn;
    }

    /**
     * Get the exit definition of a room's exit by searching the exit name
     */
    public findExit(exitName: string): RoomExitDefinition {
        return this.getExits()
            .find(ex => ex.direction.indexOf(exitName) === 0);
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
            .find(ex => ex.roomId === nextRoom.entityReference);
    }

    /**
     * Check to see if this room has a door preventing movement from `fromRoom` to here
     */
    public hasDoor(fromRoom): boolean {
        return this._doors.has(fromRoom.entityReference);
    }

    public hydrate(state: GameState): void {
        super.hydrate(state);

        /**
         * Fires when the room is created but before it has hydrated its default
         * contents. Use the `ready` event if you need default items to be there.
         * @event Room#spawn
         */
        this.emit('spawn');

        this.items.clear();

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
        this.items.delete(item);
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

    public spawnItem(state: GameState, entityRef: string): Item {
        Logger.verbose(`SPAWN: Adding item [${entityRef}] to room [${this.title}]`);

        const newItem = state.itemFactory.create(entityRef, this.area);

        newItem.hydrate(state);
        newItem.sourceRoom = this;

        state.itemManager.add(newItem);

        this.addItem(newItem);

        /**
         * @event Item#spawn
         */
        newItem.emit('spawn');

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

        Logger.verbose(`Spawned NPC "${newNpc.entityReference}"`);

        /**
         * @event Npc#spawn
         */
        newNpc.emit('spawn');

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
