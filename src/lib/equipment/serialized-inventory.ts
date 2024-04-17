import type SimpleMap from '../util/simple-map.js';

import type SerializedItem from './serialized-item.js';

export type SerializedInventory = SimpleMap & Record<string, SerializedItem>;

export default SerializedInventory;
