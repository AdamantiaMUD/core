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
        const definition = this.getDefinition(entityRef);

        if (!definition) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        const room = new Room(definition, area);

        if (this._scripts.has(entityRef)) {
            this._scripts.get(entityRef).attach(room);
        }

        return room;
    }
}

export default RoomFactory;
