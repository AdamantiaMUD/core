import {InventoryFullError} from './errors';
import {hasValue} from '../util/functions';

import type CharacterInterface from '../characters/character-interface';
import type GameStateData from '../game-state-data';
import type Serializable from '../data/serializable';
import type SimpleMap from '../util/simple-map';
import type {Item, SerializedItem} from './item';

export interface SerializedInventory extends SimpleMap {
    [key: string]: SerializedItem;
}

/**
 * Representation of a `Character` or container `Item` inventory
 */
export class Inventory implements Serializable {
    private readonly _items: Map<string, Item> = new Map<string, Item>();

    public maxSize: number = Infinity;

    public deserialize(data: SerializedInventory, carriedBy: CharacterInterface | Item, state: GameStateData): void {
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
        const data = {};

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
