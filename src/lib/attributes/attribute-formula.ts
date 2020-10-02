import type AttributeFormulaDefinition from './attribute-formula-definition';
import type CharacterInterface from '../characters/character-interface';
import type SimpleMap from '../util/simple-map';

export class AttributeFormula {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _formula: AttributeFormulaDefinition['fn'];
    private readonly _metadata: SimpleMap;
    public requires: string[];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(requires: string[], fn: AttributeFormulaDefinition['fn'], metadata: SimpleMap = {}) {
        this.requires = requires;
        this._formula = fn;
        this._metadata = metadata;
    }

    public evaluate(character: CharacterInterface, current: number, ...args: number[]): number {
        return this._formula(character, current, ...args);
    }
}

export default AttributeFormula;
