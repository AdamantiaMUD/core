import Item from './item';

/**
 * Keep track of all items in game
 */
export class ItemManager {
    private _items: Set<Item> = new Set();

    public add(item: Item): void {
        this._items.add(item);
    }

    public remove(item: Item): void {
        item.room?.removeItem(item);
        item.carriedBy?.removeItem(item);
        item.inventory?.items.forEach(childItem => this.remove(childItem));

        item.removeAllListeners();

        item.__pruned = true;

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
            item.emit('update-tick');
        }
    }
}

export default ItemManager;
