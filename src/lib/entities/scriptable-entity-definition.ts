import type SimpleMap from '../util/simple-map.js';
import type GameEntityDefinition from './game-entity-definition.js';

export interface ScriptableEntityDefinition extends GameEntityDefinition {
    behaviors?: Record<string, SimpleMap | true | null>;
    script?: string;
}

export default ScriptableEntityDefinition;
