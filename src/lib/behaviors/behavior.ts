import type SimpleMap from '../util/simple-map';

export type Behavior = (config: SimpleMap, ...args: unknown[]) => void;

export default Behavior;
