import type Effect from '../effect.js';

export type EffectAttributeModifier = (
    effect: Effect,
    current: number
) => number;

export default EffectAttributeModifier;
