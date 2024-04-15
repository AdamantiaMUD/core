import type SimpleMap from '../util/simple-map.js';

export type Behavior = (config: SimpleMap, ...args: unknown[]) => void;

export default Behavior;
