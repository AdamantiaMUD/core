import {SimpleMap} from '../../index';
import GameEntity from './game-entity';
import Serializable from '../data/serializable';

export class Character extends GameEntity implements Serializable {
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

export default Character;
