import type AttributeFormulaDefinition from './attribute-formula-definition.js';
import type SimpleMap from '../util/simple-map.js';

export interface AttributeDefinition {
    name: string;
    base: number;
    formula?: AttributeFormulaDefinition | null;
    metadata?: SimpleMap;
}

export default AttributeDefinition;
