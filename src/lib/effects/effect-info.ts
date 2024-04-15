import type EffectDefinition from './effect-definition.js';
import type MudEventManager from '../events/mud-event-manager.js';

export interface EffectInfo {
    definition: EffectDefinition;
    eventManager: MudEventManager;
}

export default EffectInfo;
