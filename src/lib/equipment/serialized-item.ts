import type SerializedScriptableEntity from '../entities/serialized-scriptable-entity';

export interface SerializedItem extends SerializedScriptableEntity {
    uuid: string;
}

export default SerializedItem;
