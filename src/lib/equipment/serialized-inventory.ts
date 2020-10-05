import type SimpleMap from '../util/simple-map';
import type SerializedItem from './serialized-item';

export interface SerializedInventory extends SimpleMap {
    [key: string]: SerializedItem;
}

export default SerializedInventory;
