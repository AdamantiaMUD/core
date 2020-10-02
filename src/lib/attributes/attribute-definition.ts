import type AttributeFormulaDefinition from './attribute-formula-definition';
import type SimpleMap from '../util/simple-map';

export interface AttributeDefinition {
    name: string;
    base: number;
    formula?: AttributeFormulaDefinition;
    metadata?: SimpleMap;
}

export default AttributeDefinition;
