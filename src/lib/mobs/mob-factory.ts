import EntityFactory from '../entities/entity-factory.js';
import Npc from './npc.js';
import {hasValue} from '../util/functions.js';

import type Area from '../locations/area.js';
import type NpcDefinition from './npc-definition.js';

/**
 * Stores definitions of npcs to allow for easy creation/cloning
 */
export class MobFactory extends EntityFactory<Npc, NpcDefinition> {
    public clone(entity: Npc): Npc {
        return this.create(entity.entityReference, entity.area);
    }

    /**
     * Create a new instance of a given npc definition. Resulting npc will not
     * have its default inventory.  If you want to also populate its default
     * contents you must manually call `npc.hydrate(state)`
     */
    public create(entityRef: string, area: Area): Npc {
        const definition = this.getDefinition(entityRef);

        if (!hasValue(definition)) {
            throw new Error(`No Entity definition found for ${entityRef}`);
        }

        const npc = new Npc(area, {...definition, entityReference: entityRef});

        if (this._scripts.has(entityRef)) {
            this._scripts.get(entityRef).attach(npc);
        }

        return npc;
    }
}

export default MobFactory;
