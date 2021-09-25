import type Character from '../characters/character';
import type SimpleMap from '../util/simple-map';

export interface AttributeFormulaDefinition {
    requires: string[];
    fn: (character: Character, current: number, ...args: unknown[]) => number;
    metadata?: SimpleMap;
}

export default AttributeFormulaDefinition;
