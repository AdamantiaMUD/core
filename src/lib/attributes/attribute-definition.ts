import type SimpleMap from '../util/simple-map.js';

import type AttributeFormulaDefinition from './attribute-formula-definition.js';

export interface AttributeDefinition {
    name: string;
    base: number;
    formula?: AttributeFormulaDefinition | null;
    metadata?: SimpleMap;
}

export default AttributeDefinition;
