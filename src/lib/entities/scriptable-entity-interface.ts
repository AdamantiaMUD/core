import type GameEntity from './game-entity';
import type GameStateData from '../game-state-data';
import type Scriptable from './scriptable';
import type Serializable from '../data/serializable';
import type SerializedScriptableEntity from './serialized-scriptable-entity';
import type SimpleMap from '../util/simple-map';

export interface ScriptableEntityInterface extends GameEntity, Scriptable, Serializable {
    readonly behaviors: Map<string, SimpleMap | true | null>;

    getBehavior: (name: string) => (SimpleMap | true | null);
    hasBehavior: (name: string) => boolean;
    hydrate: (state: GameStateData) => void;
    serialize: () => SerializedScriptableEntity;
}
export default ScriptableEntityInterface;
