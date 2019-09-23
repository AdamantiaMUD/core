import Account from './account';
import Character from '../entities/character';
import Room from '../locations/room';
import TransportStream from '../communication/transport-stream';
import {SimpleMap} from '../../../index';

export class Player extends Character {
    public account: Account;
    public name: string;
    public room: Room = null;
    public socket: TransportStream<any> = null;

    public constructor(data: any = {}) {
        super(data);
    }

    public serialize(): SimpleMap {
        const data: SimpleMap = {
            ...super.serialize(),
        };

        return data;
    }
}

export default Player;
