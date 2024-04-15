import type ItemType from './item-type.js';
import type ScriptableEntityDefinition from '../entities/scriptable-entity-definition.js';

export interface ItemDefinition extends ScriptableEntityDefinition {
    description?: string;
    flags?: string[];
    id: string;
    keywords: string[];
    level?: number;
    maxItems?: number;
    name: string;
    roomDesc: string;
    type: ItemType;
}

export default ItemDefinition;
