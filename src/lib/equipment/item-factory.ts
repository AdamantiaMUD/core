import Area from '../locations/area';
import EntityFactory from '../entities/entity-factory';
import Item, {ItemDefinition} from './item';

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export class ItemFactory extends EntityFactory<Item, ItemDefinition> {
    public clone(entity: Item): Item {
        return this.create(entity.entityReference, entity.area);
    }

    /**
     * Create a new instance of an item by EntityReference. Resulting item will
     * not be held or equipped and will _not_ have its default contents. If you
     * want it to also populate its default contents you must manually call
     * `item.hydrate(state)`
     */
    public create(ref: string, area: Area): Item {
        const definition = this.getDefinition(ref) as ItemDefinition;

        if (!definition) {
            throw new Error(`No Entity definition found for ${ref}`);
        }

        const item = new Item(ref, definition, area);

        if (this._scripts.has(ref)) {
            this._scripts.get(ref).attach(item);
        }

        item.area = area;

        return item;
    }
}

export default ItemFactory;