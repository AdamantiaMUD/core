import type SimpleMap from '../util/simple-map';
import type SerializedGameEntity from './serialized-game-entity';

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: {[key: string]: SimpleMap | true | null};
}

export default SerializedScriptableEntity;
