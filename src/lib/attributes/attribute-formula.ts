import {safeBind} from '../util/functions';

import type Attribute from './attribute';

export class AttributeFormula {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _formula: (...args: number[]) => number;
    public requires: string[];
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(requires: string[], fn: (...args: number[]) => number) {
        this.requires = requires;
        this._formula = fn;
    }

    public evaluate(attribute: Attribute, ...args: number[]): number {
        return safeBind(this._formula, attribute)(...args);
    }
}

export default AttributeFormula;
