import type Effect from '../effect.js';

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
export type EffectModifier = (effect: Effect, ...args: any[]) => any;

export default EffectModifier;
