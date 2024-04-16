import type GameEntity from './game-entity.js';
import type GameStateData from '../game-state-data.js';
import type Scriptable from './scriptable.js';
import type Serializable from '../data/serializable.js';
import type SerializedScriptableEntity from './serialized-scriptable-entity.js';
import type SimpleMap from '../util/simple-map.js';

export interface ScriptableEntityInterface
    extends GameEntity,
        Scriptable,
        Serializable {
    readonly behaviors: Map<string, SimpleMap | true | null>;

    getBehavior: (name: string) => SimpleMap | true | null;
    hasBehavior: (name: string) => boolean;
    hydrate: (state: GameStateData) => void;
    serialize: () => SerializedScriptableEntity;
}
export default ScriptableEntityInterface;
