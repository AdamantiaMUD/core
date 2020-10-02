import type Effect from '../effect';

export type EffectModifier = (effect: Effect, ...args: unknown[]) => unknown;

export default EffectModifier;
