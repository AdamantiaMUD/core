import type EffectDefinition from './effect-definition';
import type MudEventManager from '../events/mud-event-manager';

export interface EffectInfo {
    definition: EffectDefinition;
    eventManager: MudEventManager;
}

export default EffectInfo;
