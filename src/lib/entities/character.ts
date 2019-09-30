import GameEntity from './game-entity';
import Serializable from '../data/serializable';
import TransportStream from '../communication/transport-stream';
import {Broadcastable} from '../communication/broadcast';
import {SimpleMap} from '../../../index';

export class Character extends GameEntity implements Broadcastable, Serializable {
    public socket: TransportStream<any> = null;

    public constructor(data: any = {}) {
        super(data);
    }

    public getBroadcastTargets(): Character[] {
        return [this];
    }

    public serialize(): SimpleMap {
        const data: SimpleMap = {
            ...super.serialize(),
        };

        return data;
    }
}

export default Character;
