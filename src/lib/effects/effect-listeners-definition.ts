import type Effect from './effect';

export interface EffectListenersDefinition {
    effectActivated?: (effect?: Effect) => void;
    effectAdded?: (effect?: Effect) => void;
    effectDeactivated?: (effect?: Effect) => void;
    effectRefreshed?: (effect?: Effect) => void;
    [key: string]: ((effect?: Effect, ...args: unknown[]) => void) | undefined;
}

export default EffectListenersDefinition;
