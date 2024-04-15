import type SerializedScriptableEntity from '../entities/serialized-scriptable-entity.js';

export interface SerializedItem extends SerializedScriptableEntity {
    uuid: string;
}

export default SerializedItem;
