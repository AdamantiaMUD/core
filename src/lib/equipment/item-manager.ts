import { UpdateTickEvent } from '../common/events/index.js';

import type Item from './item.js';

/**
 * Keep track of all items in game
 */
export class ItemManager {
    private readonly _items: Set<Item> = new Set();

    public get items(): Set<Item> {
        return this._items;
    }

    public add(item: Item): void {
        this._items.add(item);
    }

    public remove(item: Item): void {
        item.room?.removeItem(item);
        item.carriedBy?.removeItem(item);
        item.inventory?.items.forEach((childItem: Item) =>
            this.remove(childItem)
        );

        item.stopListening();

        item.setPruned();

        this._items.delete(item);
    }

    public tickAll(): void {
        for (const item of this._items) {
            item.dispatch(new UpdateTickEvent());
        }
    }
}

export default ItemManager;
