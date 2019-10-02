// import Attribute from '../attributes/attribute';
// import CharacterAttributes from '../attributes/character-attributes';
// import Inventory from '../equipment/inventory';
import GameEntity from './game-entity';
import Room from '../locations/room';
import Serializable from '../data/serializable';
import TransportStream from '../communication/transport-stream';
import {SimpleMap} from '../../../index';

export class Character extends GameEntity implements Serializable {
    // private readonly _attributes: CharacterAttributes = new CharacterAttributes();
    // private readonly _inventory: Inventory;
    public name: string = '';
    public room: Room = null;
    public socket: TransportStream<any> = null;

    public constructor(data: any = {}) {
        super(data);
    }

    // public get attributes(): IterableIterator<[string, Attribute]> {
    //     return this._attributes.getAttributes();
    // }
    //
    // /**
    //  * Get the current value of an attribute (base modified by delta)
    //  */
    // public getAttribute(attr: string, defaultValue: number = null): number {
    //     if (!this.hasAttribute(attr)) {
    //         if (defaultValue !== null) {
    //             return defaultValue;
    //         }
    //
    //         throw new RangeError(`Character does not have attribute [${attr}]`);
    //     }
    //
    //     return this.getMaxAttribute(attr) + this._attributes.get(attr).delta;
    // }
    //
    // /**
    //  * Get the base value for a given attribute
    //  */
    // public getBaseAttribute(attr: string): number {
    //     const att = this._attributes.get(attr);
    //
    //     return att && att.base;
    // }
    //
    // /**
    //  * Get current maximum value of attribute (as modified by effects.)
    //  */
    // public getMaxAttribute(attr: string): number {
    //     if (!this.hasAttribute(attr)) {
    //         throw new RangeError(`Character does not have attribute [${attr}]`);
    //     }
    //
    //     const attribute = this._attributes.get(attr);
    //     const currentVal = this.effects.evaluateAttribute(attribute);
    //
    //     if (!attribute.formula) {
    //         return currentVal;
    //     }
    //
    //     const {formula} = attribute;
    //
    //     const requiredValues = formula.requires.map(att => this.getMaxAttribute(att));
    //
    //     /* eslint-disable-next-line no-useless-call */
    //     return formula.evaluate.apply(formula, [
    //         attribute,
    //         this,
    //         currentVal,
    //         ...requiredValues,
    //     ]);
    // }
    //
    // public hasAttribute(attr: string): boolean {
    //     return this._attributes.has(attr);
    // }
    //
    // public get inventory(): Inventory {
    //     return this._inventory;
    // }
    //
    // public getAttributeNames(): IterableIterator<string> {
    //     return this._attributes.getAttributeNames();
    // }

    public serialize(): SimpleMap {
        const data: SimpleMap = {
            ...super.serialize(),
        };

        return data;
    }
}

export default Character;
