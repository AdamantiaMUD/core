import EntityFactory from '../entities/entity-factory.js';
import type Area from '../locations/area.js';
import { hasValue } from '../util/functions.js';

import type ItemDefinition from './item-definition.js';
import Item from './item.js';

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export class ItemFactory extends EntityFactory<Item, ItemDefinition> {
    public clone(entity: Item): Item | null {
        return this.create(entity.entityReference, entity.area);
    }

    /**
     * Create a new instance of an item by EntityReference. Resulting item will
     * not be held or equipped and will _not_ have its default contents. If you
     * want it to also populate its default contents you must manually call
     * `item.hydrate(state)`
     */
    public create(entityRef: string | null, area: Area): Item | null {
        if (!hasValue(entityRef)) {
            return null;
        }

        const definition = this.getDefinition(entityRef);

        if (!hasValue(definition)) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        const item = new Item(definition, area);

        if (this._scripts.has(entityRef)) {
            this._scripts.get(entityRef).attach(item);
        }

        return item;
    }
}

export default ItemFactory;
