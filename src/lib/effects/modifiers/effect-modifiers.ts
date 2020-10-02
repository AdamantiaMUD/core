import type Damage from '../../combat/damage';
import type Effect from '../effect';
import type EffectAttributeModifier from './effect-attribute-modifier';
import type EffectAttributeModifierFunction from './effect-attribute-modifier-function';
import type EffectModifier from './effect-modifier';

export interface EffectModifiers {
    attributes?: EffectAttributeModifierFunction | {[key: string]: EffectAttributeModifier};
    incomingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    outgoingDamage?: (effect: Effect, source: Damage, amount: number) => number;
    [key: string]: EffectModifier | {[key: string]: EffectModifier} | undefined;
}

export default EffectModifiers;
