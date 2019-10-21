import cloneFactory from 'rfdc';
import Npc from '../mobs/npc';
import Logger from '../util/logger';

import Area from './area';
import GameEntity, {GameEntityDefinition} from '../entities/game-entity';
import GameState from '../game-state';
import Item from '../equipment/item';
import Player from '../players/player';
import {Broadcastable} from '../communication/broadcast';
import {SimpleMap} from '../../../index';

const clone = cloneFactory();

export interface RoomDefinition extends GameEntityDefinition {
    description: string;
    exits?: RoomExitDefinition[];
    id: string;
    title: string;
    // @TODO: should this be an enum?
    type?: string;
}

export interface RoomExitDefinition {
    // @TODO: make directions an enum
    direction: string;
    leaveMessage?: string;
    roomId: string;
}

export class Room extends GameEntity implements Broadcastable {
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

    /**
     * Emits event on self and proxies certain events to other entities in the room.
     */
    public emit(eventName: string | symbol, ...args: any[]): boolean {
        const superReturn = super.emit(eventName, ...args);

        const proxiedEvents = [
            'playerEnter',
            'playerLeave',
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

    public hydrate(state: GameState): void {
        /**
         * Fires when the room is created but before it has hydrated its default
         * contents. Use the `ready` event if you need default items to be there.
         * @event Room#spawn
         */
        this.emit('spawn');
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
        Logger.verbose(`\tSPAWN: Adding item [${entityRef}] to room [${this.title}]`);

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
}

export default Room;
