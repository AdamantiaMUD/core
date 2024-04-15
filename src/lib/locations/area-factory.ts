import Area from './area.js';
import EntityFactory from '../entities/entity-factory.js';
import {hasValue} from '../util/functions.js';

import type AreaDefinition from './area-definition.js';

/**
 * Stores definitions of items to allow for easy creation/cloning of objects
 */
export class AreaFactory extends EntityFactory<Area, AreaDefinition> {
    public clone(area: Area): Area {
        return this.create(area.name);
    }

    /**
     * Create a new instance of an area by name. Resulting area will not have
     * any of its contained entities (items, npcs, rooms) hydrated. You will
     * need to call `area.hydrate(state)`
     */
    public create(entityRef: string): Area {
        const definition = this.getDefinition(entityRef);

        if (!hasValue(definition)) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        const area = new Area(definition.bundle, entityRef, definition.manifest);

        if (this._scripts.has(entityRef)) {
            this._scripts.get(entityRef).attach(area);
        }

        return area;
    }
}

export default AreaFactory;
