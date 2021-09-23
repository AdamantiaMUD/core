import type Damage from '../../combat/damage';
import type Effect from '../effect';
import type EffectAttributeModifier from './effect-attribute-modifier';
import type EffectAttributeModifierFunction from './effect-attribute-modifier-function';
import type EffectModifier from './effect-modifier';

export type EffectModifiers = Record<string, EffectModifier | Record<string, EffectModifier>> & {
    /*  eslint-disable-next-line lines-around-comment -- see https://github.com/typescript-eslint/typescript-eslint/issues/1150 */
    /**
     * The attributes sub-property lets you define which attributes are modified
     * by this effect.
     */
    attributes?: EffectAttributeModifierFunction | Record<string, EffectAttributeModifier>;

    /**
     * the incomingDamage modifier, and its sibling property outgoingDamage, let you do
     * what it says on the tin. The function takes the Damage object (see `src/Damage.js`
     * for more detail) and the current amount of damage about to be dealt.
     */
    incomingDamage?: (effect: Effect, source: Damage, amount: number) => number;

    /**
     * the outgoingDamage modifier, and its sibling property incomingDamage, let you do
     * what it says on the tin. The function takes the Damage object (see `src/Damage.js`
     * for more detail) and the current amount of damage about to be dealt.
     */
    outgoingDamage?: (effect: Effect, source: Damage, amount: number) => number;
};

export default EffectModifiers;
