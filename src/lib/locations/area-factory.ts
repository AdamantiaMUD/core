import Area, {AreaDefinition} from './area';
import EntityFactory from '../entities/entity-factory';

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

        if (!definition) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        return new Area(definition.bundle, entityRef, definition.manifest);
    }
}

export default AreaFactory;
