import cloneFactory from 'rfdc';
import {Broadcastable} from '../communication/broadcast';

import Area from './area';
import GameEntity from '../entities/game-entity';
import GameState from '../game-state';
import Player from '../players/player';
import {SimpleMap} from '../../../index';

const clone = cloneFactory();

export interface RoomDefinition {
    description: string;
    exits?: RoomExitDefinition[];
    id: string;
    metadata?: SimpleMap;
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
    /* eslint-disable lines-between-class-members */
    public area: Area;
    public def: RoomDefinition;
    public description: string;
    public exits: RoomExitDefinition[];
    public id: string;
    public name: string;
    public players: Set<Player> = new Set();
    public title: string;
    /* eslint-enable lines-between-class-members */

    public constructor(area: Area, def: RoomDefinition) {
        super({
            ...def,
            entityReference: `${area.name}:${def.id}`,
        });

        this.area = area;
        this.def = def;
        this.description = def.description;
        this.exits = def.exits || [];
        this.id = def.id;
        this.name = def.title;
        this.title = def.title;
    }

    public addPlayer(player: Player): void {
        this.players.add(player);
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
            const entities = [...this.players];

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
        return [...this.players];
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

    public removePlayer(player: Player): void {
        this.players.delete(player);
    }
}

export default Room;
