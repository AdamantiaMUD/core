import type ItemType from './item-type';
import type ScriptableEntityDefinition from '../entities/scriptable-entity-definition';

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
