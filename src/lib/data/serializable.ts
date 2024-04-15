import type SimpleMap from '../util/simple-map.js';

export interface Serializable {
    serialize: () => (SimpleMap | SimpleMap[]);
}

export default Serializable;
