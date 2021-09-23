import type Door from './door';
import type RoomEntityDefinition from './room-entity-definition';
import type RoomExitDefinition from './room-exit-definition';
import type ScriptableEntityDefinition from '../entities/scriptable-entity-definition';

export interface RoomDefinition extends ScriptableEntityDefinition {
    description: string;
    doors?: Record<string, Door>;
    exits?: RoomExitDefinition[];
    id: string;
    items?: RoomEntityDefinition[];
    npcs?: RoomEntityDefinition[];
    title: string;

    // @TODO: should this be an enum?
    type?: string;
}

export default RoomDefinition;
