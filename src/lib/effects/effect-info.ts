import type MudEventManager from '../events/mud-event-manager.js';

import type EffectDefinition from './effect-definition.js';

export interface EffectInfo {
    definition: EffectDefinition;
    eventManager: MudEventManager;
}

export default EffectInfo;
