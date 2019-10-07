import Character from '../entities/character';
import GameState from '../game-state';
import Item, {SerializedItem} from './item';
import Serializable from '../data/serializable';
import {InventoryFullError} from './equipment-errors';
import {SimpleMap} from '../../../index';

export interface SerializedInventory extends SimpleMap {
    [key: string]: SerializedItem;
}

/**
 * Representation of a `Character` or container `Item` inventory
 */
export class Inventory implements Serializable {
    private readonly _items: Map<string, Item> = new Map();

    /* eslint-disable lines-between-class-members */
    public maxSize: number = Infinity;

    private readonly serializedItems: SerializedInventory;
    /* eslint-enable lines-between-class-members */

    public constructor(init: SerializedInventory = {}) {
        this.serializedItems = init;
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

    public hydrate(state: GameState, carriedBy: Character | Item): void {
        for (const [uuid, def] of Object.entries(this.serializedItems)) {
            const area = state.areaManager.getAreaByReference(def.entityReference);
            const newItem = state.itemFactory.create(def.entityReference, area);

            newItem.uuid = uuid;
            newItem.carriedBy = carriedBy;
            newItem.initializeInventory(def.inventory);
            newItem.hydrate(state, def);

            this._items.set(uuid, newItem);

            state.itemManager.add(newItem);
        }
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
