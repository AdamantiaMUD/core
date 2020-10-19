import Logger from '../common/logger';
import {CharacterAttributeUpdateEvent} from '../characters/events';

import type CharacterInterface from '../characters/character-interface';
import type GameStateData from '../game-state-data';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';
import type {Attribute, SerializedAttribute} from './attribute';

export interface SerializedCharacterAttributes extends SimpleMap {
    [key: string]: SerializedAttribute;
}

/**
 * Container for a list of attributes for a {@link Character}
 */
export class CharacterAttributes implements Serializable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _attributes: Map<string, Attribute> = new Map<string, Attribute>();
    private readonly _target: CharacterInterface;
    private readonly _unknownAttributes: Map<string, SerializedAttribute> = new Map<string, SerializedAttribute>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(target: CharacterInterface) {
        this._target = target;
    }

    public add(attribute: Attribute): void {
        this._attributes.set(attribute.name, attribute);
    }

    public deserialize(data: SerializedCharacterAttributes, state: GameStateData): void {
        Object.entries(data)
            .forEach(([attr, config]: [string, SerializedAttribute]) => {
                const attrName = attr.replace('unknown:', '');

                if (state.attributeFactory.has(attrName)) {
                    const attribute = state.attributeFactory.create(attrName);

                    attribute!.deserialize(config);

                    this.add(attribute!);
                }
                else {
                    Logger.warn(`Entity trying to deserialize with unknown attribute ${attrName}`);
                    this._unknownAttributes.set(attrName, config);
                }
            });
    }

    public get(key: string): Attribute | null {
        return this._attributes.get(key) ?? null;
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

    public modify(key: string, amount: number): void {
        if (!this.has(key)) {
            throw new Error(`Invalid attribute ${key}`);
        }

        this.get(key)!.modify(amount);

        this._target.dispatch(new CharacterAttributeUpdateEvent({attr: key, value: this.get(key)!}));
    }

    public reset(): void {
        for (const [, attr] of this._attributes) {
            attr.setDelta(0);
        }
    }

    public serialize(): SerializedCharacterAttributes {
        const data = {};

        [...this._attributes].forEach(([name, attribute]: [string, Attribute]) => {
            data[name] = attribute.serialize();
        });

        [...this._unknownAttributes].forEach(([name, config]: [string, SerializedAttribute]) => {
            data[`unknown:${name}`] = config;
        });

        return data;
    }
}

export default CharacterAttributes;
