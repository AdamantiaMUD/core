import type Character from '../characters/character.js';
import type SimpleMap from '../util/simple-map.js';

import type AttributeFormulaDefinition from './attribute-formula-definition.js';

export class AttributeFormula {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _formula: AttributeFormulaDefinition['fn'];
    private readonly _metadata: SimpleMap;
    public requires: string[];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(
        requires: string[],
        fn: AttributeFormulaDefinition['fn'],
        metadata: SimpleMap = {}
    ) {
        this.requires = requires;
        this._formula = fn;
        this._metadata = metadata;
    }

    public evaluate(
        character: Character,
        current: number,
        ...args: number[]
    ): number {
        return this._formula(character, current, ...args);
    }
}

export default AttributeFormula;
