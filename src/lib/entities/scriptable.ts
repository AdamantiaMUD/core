import type SimpleMap from '../util/simple-map.js';

export interface Scriptable {
    behaviors: Map<string, SimpleMap | true | null>;
    getBehavior: (name: string) => SimpleMap | true | null;
    hasBehavior: (name: string) => boolean;
}

export default Scriptable;
