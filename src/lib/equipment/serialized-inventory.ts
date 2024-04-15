import type SimpleMap from '../util/simple-map.js';
import type SerializedItem from './serialized-item.js';

export interface SerializedInventory extends SimpleMap {
    [key: string]: SerializedItem;
}

export default SerializedInventory;
