import type Effect from './effect.js';

export type EffectListenersDefinition = Record<string, ((effect: Effect, ...args: unknown[]) => void)> & {
    effectActivated?: (effect: Effect) => void;
    effectAdded?: (effect: Effect) => void;
    effectDeactivated?: (effect: Effect) => void;
    effectRefreshed?: (effect: Effect) => void;
};

export default EffectListenersDefinition;
