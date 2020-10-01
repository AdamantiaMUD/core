import type AttributeFormula from './attribute-formula';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';

export interface SerializedAttribute extends SimpleMap {
    base: number;
    delta?: number;
}

/**
 * Representation of an "Attribute" which is any value that has a base amount and depleted/restored
 * safely. Where safely means without being destructive to the base value.
 *
 * An attribute on its own cannot be raised above its base value. To raise attributes above their
 * base temporarily see the {@link http://ranviermud.com/extending/effects|Effect guide}.
 */
export class Attribute implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private _base: number;
    private _delta: number;

    public readonly formula: AttributeFormula | null;
    public readonly metadata: SimpleMap;
    public readonly name: string;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(
        name: string,
        base: number,
        delta: number = 0,
        formula: AttributeFormula | null = null,
        metadata: SimpleMap = {}
    ) {
        this._base = base;
        this._delta = delta;

        this.formula = formula;
        this.metadata = metadata;
        this.name = name;
    }

    public get base(): number {
        return this._base;
    }

    public get delta(): number {
        return this._delta;
    }

    public get value(): number {
        return this._base + this._delta;
    }

    public deserialize(data: SerializedAttribute): void {
        this.setBase(data.base);
        this.setDelta(data.delta ?? 0);
    }

    public modify(amount: number): void {
        this.setDelta(this._delta + amount);
    }

    public reset(): void {
        this._delta = 0;
    }

    public serialize(): SerializedAttribute {
        const {delta, base} = this;

        return {delta, base};
    }

    public setBase(amount: number): void {
        this._base = Math.max(amount, 0);
    }

    public setDelta(amount: number): void {
        this._delta = Math.min(amount, 0);
    }
}

export default Attribute;
