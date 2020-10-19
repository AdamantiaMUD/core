import type Effect from './effect';

export type EffectListenersDefinition = {[key: string]: ((effect: Effect, ...args: unknown[]) => void)} & {
    effectActivated?: (effect: Effect) => void;
    effectAdded?: (effect: Effect) => void;
    effectDeactivated?: (effect: Effect) => void;
    effectRefreshed?: (effect: Effect) => void;
};

export default EffectListenersDefinition;
