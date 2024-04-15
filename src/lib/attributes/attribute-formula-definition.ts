import type Character from '../characters/character.js';
import type SimpleMap from '../util/simple-map.js';

export interface AttributeFormulaDefinition {
    requires: string[];
    fn: (character: Character, current: number, ...args: unknown[]) => number;
    metadata?: SimpleMap;
}

export default AttributeFormulaDefinition;
