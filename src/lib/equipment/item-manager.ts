import Item from './item';
import ItemType from './item-type';

/**
 * Keep track of all items in game
 */
export class ItemManager {
    private _items: Set<Item> = new Set();

    public add(item: Item): void {
        this._items.add(item);
    }

    public remove(item: Item): void {
        if (item.room) {
            item.room.removeItem(item);
        }

        if (item.carriedBy) {
            item.carriedBy.removeItem(item);
        }

        if (item.type === ItemType.CONTAINER && item.inventory) {
            item.inventory.items.forEach(childItem => this.remove(childItem));
        }

        item.__pruned = true;
        item.removeAllListeners();
        this._items.delete(item);
    }

    /**
     * @fires Item#updateTick
     */
    public tickAll(): void {
        for (const item of this._items) {
            /**
             * @event Item#updateTick
             */
            item.emit('updateTick');
        }
    }
}

export default ItemManager;
