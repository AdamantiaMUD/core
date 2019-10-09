import Attribute from './attribute';

export class AttributeFormula {
    /* eslint-disable lines-between-class-members */
    private readonly formula: (...args: number[]) => number;
    public requires: string[];
    /* eslint-enable lines-between-class-members */

    public constructor(requires: string[], fn: (...args: number[]) => number) {
        this.requires = requires;
        this.formula = fn;
    }

    public evaluate(attribute: Attribute, ...args: number[]): number {
        return this.formula.bind(attribute)(...args);
    }
}

export default AttributeFormula;
