import Damage from '../combat/damage';
import Effect from './effect';

export type EffectAttributeModifier = (effect: Effect, current: number) => number;

export type EffectAttributeModifierFunction = (
    effect: Effect,
    attribute: string,
    current: number
) => number;

export type EffectModifier = (effect: Effect, ...args: unknown[]) => unknown;

export interface EffectModifiers {
    attributes?: EffectAttributeModifierFunction | {[key: string]: EffectAttributeModifier};
    incomingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    outgoingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    [key: string]: EffectModifier | {[key: string]: EffectModifier};
}
