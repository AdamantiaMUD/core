import {InventoryFullError} from './errors/index.js';
import {hasValue} from '../util/functions.js';

import type Character from '../characters/character.js';
import type GameStateData from '../game-state-data.js';
import type Serializable from '../data/serializable.js';
import type Item from './item.js';
import type SerializedInventory from './serialized-inventory.js';
import type SerializedItem from './serialized-item.js';

/**
 * Representation of a `Character` or container `Item` inventory
 */
export class Inventory implements Serializable {
    private readonly _items: Map<string, Item> = new Map<string, Item>();

    public maxSize: number = Infinity;

    public deserialize(data: SerializedInventory, carriedBy: Character | Item, state: GameStateData): void {
        for (const [uuid, itemData] of Object.entries(data)) {
            const area = state.areaManager.getAreaByReference(itemData.entityReference);

            if (hasValue(area)) {
                const newItem = state.itemFactory.create(itemData.entityReference, area);

                if (hasValue(newItem)) {
                    newItem.setCarrier(carriedBy);

                    newItem.deserialize(itemData, state);

                    this._items.set(uuid, newItem);

                    state.itemManager.add(newItem);
                }
                else {
                    // @TODO: log warning
                }
            }
            else {
                // @TODO: log warning
            }
        }
    }

    public get isFull(): boolean {
        return this._items.size >= this.maxSize;
    }

    public get items(): Map<string, Item> {
        return this._items;
    }

    public get size(): number {
        return this._items.size;
    }

    public addItem(item: Item): void {
        if (this.isFull) {
            throw new InventoryFullError();
        }

        this._items.set(item.uuid, item);
    }

    public getMax(): number {
        return this.maxSize;
    }

    public removeItem(item: Item): void {
        this._items.delete(item.uuid);
    }

    public serialize(): SerializedInventory {
        const data: Record<string, SerializedItem> = {};

        for (const [uuid, item] of this._items) {
            data[uuid] = item.serialize();
        }

        return data;
    }

    public setMax(size: number): void {
        this.maxSize = size;
    }
}

export default Inventory;
