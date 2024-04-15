import type AreaManifest from './area-manifest.js';
import type ScriptableEntityDefinition from '../entities/scriptable-entity-definition.js';

export interface AreaDefinition extends ScriptableEntityDefinition {
    bundle: string;
    items: string[];
    manifest: AreaManifest;
    npcs: string[];
    quests: string[];
    rooms: string[];
}

export default AreaDefinition;
