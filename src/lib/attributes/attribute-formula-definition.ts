import type CharacterInterface from '../characters/character-interface';
import type SimpleMap from '../util/simple-map';

export interface AttributeFormulaDefinition {
    requires: string[];
    fn: (character: CharacterInterface, current: number, ...args: unknown[]) => number;
    metadata?: SimpleMap;
}

export default AttributeFormulaDefinition;
