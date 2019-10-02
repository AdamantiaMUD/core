// import Attribute from './attribute';
// import Serializable from '../data/serializable';
// import {SimpleMap} from '../../../index';
//
// /**
//  * Container for a list of attributes for a {@link Character}
//  */
// export class CharacterAttributes implements Serializable {
//     private readonly _attributes: Map<string, Attribute> = new Map();
//
//     public add(attribute: Attribute): void {
//         this._attributes.set(attribute.name, attribute);
//     }
//
//     public get(key: string): Attribute {
//         return this._attributes.get(key);
//     }
//
//     public getAttributes(): IterableIterator<[string, Attribute]> {
//         return this._attributes.entries();
//     }
//
//     public getAttributeNames(): IterableIterator<string> {
//         return this._attributes.keys();
//     }
//
//     public has(key: string): boolean {
//         return this._attributes.has(key);
//     }
//
//     public reset(): void {
//         for (const [, attr] of this._attributes) {
//             attr.setDelta(0);
//         }
//     }
//
//     public serialize(): SimpleMap {
//         const data = {};
//
//         [...this._attributes].forEach(([name, attribute]) => {
//             data[name] = attribute.serialize();
//         });
//
//         return data;
//     }
// }
//
// export default CharacterAttributes;
