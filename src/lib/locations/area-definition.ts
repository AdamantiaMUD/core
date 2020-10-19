import type AreaManifest from './area-manifest';
import type ScriptableEntityDefinition from '../entities/scriptable-entity-definition';

export interface AreaDefinition extends ScriptableEntityDefinition {
    bundle: string;
    manifest: AreaManifest;
    npcs: string[];
    quests: string[];
    rooms: string[];
}

export default AreaDefinition;
