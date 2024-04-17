import type SimpleMap from '../util/simple-map.js';

import type SerializedGameEntity from './serialized-game-entity.js';

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: Record<string, SimpleMap | true | null>;
}

export default SerializedScriptableEntity;
