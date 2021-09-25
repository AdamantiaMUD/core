import type Effect from '../effect';

export type EffectAttributeModifier = (effect: Effect, current: number) => number;

export default EffectAttributeModifier;
