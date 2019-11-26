import {sprintf} from 'sprintf-js';

import Attribute from './attribute';
import AttributeFormula from './attribute-formula';
import SimpleMap from '../util/simple-map';

export interface AttributeDefinition {
    base: number;
    formula: AttributeFormula;
    metadata: SimpleMap;
    name: string;
}

export class AttributeFactory {
    private readonly _attributes: Map<string, AttributeDefinition> = new Map();

    private hasCircularDependency(
        attr: string,
        references: {[key: string]: string[]},
        stack: string[] = []
    ): string[] | false {
        if (stack.includes(attr)) {
            return stack;
        }

        const requires = references[attr];

        if (!requires || !requires.length) {
            return false;
        }

        for (const reqAttr of requires) {
            const check = this.hasCircularDependency(reqAttr, references, stack.concat(attr));

            if (check !== false) {
                return check;
            }
        }

        return false;
    }

    public add(
        name: string,
        base: number,
        formula: AttributeFormula = null,
        metadata: SimpleMap = {}
    ): void {
        if (formula && !(formula instanceof AttributeFormula)) {
            throw new TypeError('Formula not instance of AttributeFormula');
        }

        this._attributes.set(name, {
            name,
            base,
            formula,
            metadata,
        });
    }

    public create(name: string, base: number = null, delta: number = 0): Attribute {
        if (!this.has(name)) {
            throw new RangeError(`No attribute definition found for [${name}]`);
        }

        const def = this._attributes.get(name);

        return new Attribute(name, base || def.base, delta, def.formula, def.metadata);
    }

    /**
     * Get a attribute definition. Use `create` if you want an instance of a attribute
     */
    public get(name: string): AttributeDefinition {
        return this._attributes.get(name);
    }

    public has(name: string): boolean {
        return this._attributes.has(name);
    }

    /**
     * Make sure there are no circular dependencies between attributes
     */
    public validateAttributes(): void {
        const references = [...this._attributes].reduce((acc, [attrName, {formula}]) => {
            if (!formula) {
                return acc;
            }

            acc[attrName] = formula.requires;

            return acc;
        }, {});

        for (const attrName in references) {
            if (Object.prototype.hasOwnProperty.call(references, attrName)) {
                const check = this.hasCircularDependency(attrName, references);

                if (Array.isArray(check)) {
                    const path = check.concat(attrName).join(' -> ');

                    throw new Error(sprintf(
                        'Attribute formula for [%1$s] has circular dependency [%2$s]',
                        attrName,
                        path
                    ));
                }
            }
        }
    }
}

export default AttributeFactory;
