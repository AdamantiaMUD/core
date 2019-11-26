import Item from './item';
import {UpdateTickEvent} from '../common/common-events';

/**
 * Keep track of all items in game
 */
export class ItemManager {
    private readonly _items: Set<Item> = new Set();

    public add(item: Item): void {
        this._items.add(item);
    }

    public remove(item: Item): void {
        item.room?.removeItem(item);
        item.carriedBy?.removeItem(item);
        item.inventory?.items.forEach(childItem => this.remove(childItem));

        item.stopListening();

        item.__pruned = true;

        this._items.delete(item);
    }

    public tickAll(): void {
        for (const item of this._items) {
            item.dispatch(new UpdateTickEvent());
        }
    }
}

export default ItemManager;
