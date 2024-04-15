import type SimpleMap from '../util/simple-map.js';

export interface GameEntityDefinition {
    id: string;
    metadata?: SimpleMap;
}

export default GameEntityDefinition;
