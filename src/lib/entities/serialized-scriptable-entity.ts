import type SimpleMap from '../util/simple-map';
import type SerializedGameEntity from './serialized-game-entity';

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: Record<string, SimpleMap | true | null>;
}

export default SerializedScriptableEntity;
