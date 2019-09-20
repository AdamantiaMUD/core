import GameEntity from '../entities/game-entity';
import Room from './room';
import {SimpleMap} from '../../index';

export interface AreaDefinition {
    bundle: string;
    manifest: AreaManifest;
    rooms: any[];
}

export interface AreaManifest {
    metadata?: SimpleMap;
    name: string;
}

export class Area extends GameEntity {
    public readonly name: string;
    public readonly bundle: string;

    private readonly _manifest: AreaManifest;

    private _metadata: SimpleMap;
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

    public get metadata(): SimpleMap {
        return this._metadata;
    }

    public get rooms(): Map<string, any> {
        return this._rooms;
    }

    public addRoom(room: Room): void {
        this.rooms.set(room.id, room);

        this.emit('roomAdded', room);
    }
}

export default Area;
