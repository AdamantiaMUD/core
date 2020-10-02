import type SimpleMap from '../util/simple-map';
import type GameEntityDefinition from './game-entity-definition';

export interface ScriptableEntityDefinition extends GameEntityDefinition {
    behaviors?: {[key: string]: SimpleMap | true | null};
    script?: string;
}

export default ScriptableEntityDefinition;