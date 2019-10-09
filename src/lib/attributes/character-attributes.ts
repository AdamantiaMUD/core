import Attribute, {SerializedAttribute} from './attribute';
import GameState from '../game-state';
import Logger from '../util/logger';
import Serializable from '../data/serializable';
import {SimpleMap} from '../../../index';

export interface SerializedCharacterAttributes extends SimpleMap {
    [key: string]: SerializedAttribute;
}

/**
 * Container for a list of attributes for a {@link Character}
 */
export class CharacterAttributes implements Serializable {
    private readonly _attributes: Map<string, Attribute> = new Map();
    private readonly _unknownAttributes: Map<string, SerializedAttribute> = new Map();

    public add(attribute: Attribute): void {
        this._attributes.set(attribute.name, attribute);
    }

    public deserialize(data: SerializedCharacterAttributes, state: GameState): void {
        Object.entries(data)
            .forEach(([attr, config]) => {
                const attrName = attr.replace('unknown:', '');

                if (state.attributeFactory.has(attrName)) {
                    const attribute = state.attributeFactory.create(attrName);

                    attribute.deserialize(config);

                    this.add(attribute);
                }
                else {
                    Logger.warn(`Entity trying to deserialize with unknown attribute ${attrName}`);
                    this._unknownAttributes.set(attrName, config);
                }
            });
    }

    public get(key: string): Attribute {
        return this._attributes.get(key);
    }

    public getAttributes(): IterableIterator<[string, Attribute]> {
        return this._attributes.entries();
    }

    public getAttributeNames(): IterableIterator<string> {
        return this._attributes.keys();
    }

    public has(key: string): boolean {
        return this._attributes.has(key);
    }

    public reset(): void {
        for (const [, attr] of this._attributes) {
            attr.setDelta(0);
        }
    }

    public serialize(): SerializedCharacterAttributes {
        const data = {};

        [...this._attributes].forEach(([name, attribute]) => {
            data[name] = attribute.serialize();
        });

        [...this._unknownAttributes].forEach(([name, config]) => {
            data[`unknown:${name}`] = config;
        });

        return data;
    }
}

export default CharacterAttributes;
