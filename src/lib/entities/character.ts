import Inventory from '../equipment/inventory';
import GameEntity from './game-entity';
import Room from '../locations/room';
import Serializable from '../data/serializable';
import TransportStream from '../communication/transport-stream';
import {SimpleMap} from '../../../index';

export class Character extends GameEntity implements Serializable {
    private readonly _inventory: Inventory;
    public room: Room = null;
    public socket: TransportStream<any> = null;

    public constructor(data: any = {}) {
        super(data);
    }

    public get inventory(): Inventory {
        return this._inventory;
    }

    public serialize(): SimpleMap {
        const data: SimpleMap = {
            ...super.serialize(),
        };

        return data;
    }
}

export default Character;
