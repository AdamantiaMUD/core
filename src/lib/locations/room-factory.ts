import Area from './area';
import EntityFactory from '../entities/entity-factory';
import Room, {RoomDefinition} from './room';

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 */
export class RoomFactory extends EntityFactory<Room, RoomDefinition> {
    public clone(entity: Room): Room {
        return this.create(entity.entityReference, entity.area);
    }

    /**
     * Create a new instance of a given room. Room will not be hydrated
     */
    public create(entityRef: string, area: Area): Room {
        const definition = this.getDefinition(entityRef) as RoomDefinition;

        if (!definition) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        return new Room(definition, area);
    }
}

export default RoomFactory;
