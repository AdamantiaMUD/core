import GameEntity from '../entities/game-entity';
import GameState from '../game-state';
import Player from '../players/player';
import Room from './room';
import {Broadcastable} from '../communication/broadcast';
import {SimpleMap} from '../../../index';

export interface AreaDefinition {
    bundle: string;
    manifest: AreaManifest;
    rooms: any[];
}

export interface AreaManifest {
    metadata?: SimpleMap;
    name: string;
}

export class Area extends GameEntity implements Broadcastable {
    public readonly name: string;
    public readonly bundle: string;

    private readonly _manifest: AreaManifest;

    private _rooms: Map<string, any> = new Map();

    public constructor(bundle: string, name: string, manifest: AreaManifest) {
        super();

        this.bundle = bundle;
        this.name = name;

        this._manifest = manifest;

        this.on('updateTick', () => this.tickAll());
    }

    /**
     * This method is automatically called every N milliseconds where N is
     * defined in the `entityTickFrequency` configuration setting. It, in turn,
     * will fire the `updateTick` event on all its rooms
     */
    private tickAll(): void {
        for (const [, room] of this.rooms) {
            room.emit('updateTick');
        }
    }

    public get rooms(): Map<string, any> {
        return this._rooms;
    }

    public addRoom(room: Room): void {
        this.rooms.set(room.id, room);

        this.emit('roomAdded', room);
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

    public hydrate(state: GameState): void {
        const {rooms} = state.areaFactory.getDefinition(this.name);

        for (const roomRef of rooms) {
            const room = state.roomFactory.create(roomRef, this);

            this.addRoom(room);
            state.roomManager.addRoom(room);
            room.hydrate(state);

            /**
             * Fires after the room is hydrated and added to its area
             * @event Room#ready
             */
            room.emit('ready');
        }
    }
}

export default Area;
