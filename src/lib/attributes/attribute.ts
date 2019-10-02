// import AttributeFormula from './attribute-formula';
// import Serializable from '../data/serializable';
// import {SimpleMap} from '../../../index';
//
// /**
//  * Representation of an "Attribute" which is any value that has a base amount and depleted/restored
//  * safely. Where safely means without being destructive to the base value.
//  *
//  * An attribute on its own cannot be raised above its base value. To raise attributes above their
//  * base temporarily see the {@link http://ranviermud.com/extending/effects|Effect guide}.
//  */
// export class Attribute implements Serializable {
//     /* eslint-disable lines-between-class-members */
//     public base: number;
//     public delta: number;
//     public formula: AttributeFormula;
//     public metadata: SimpleMap;
//     public name: string;
//     /* eslint-enable lines-between-class-members */
//
//     public constructor(
//         name: string,
//         base: number,
//         delta: number = 0,
//         formula: AttributeFormula = null,
//         metadata: SimpleMap = {}
//     ) {
//         this.name = name;
//         this.base = base;
//         this.delta = delta;
//         this.formula = formula;
//         this.metadata = metadata;
//     }
//
//     public lower(amount: number): void {
//         this.raise(-1 * amount);
//     }
//
//     public raise(amount: number): void {
//         this.delta = Math.min(this.delta + amount, 0);
//     }
//
//     public serialize(): SimpleMap {
//         const {delta, base} = this;
//
//         return {delta, base};
//     }
//
//     public setBase(amount: number): void {
//         this.base = Math.max(amount, 0);
//     }
//
//     public setDelta(amount: number): void {
//         this.delta = Math.min(amount, 0);
//     }
// }
//
// export default Attribute;
