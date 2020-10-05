import type Ability from '../abilities/ability';
import type CharacterInterface from '../characters/character-interface';
import type EffectConfig from './effect-config';
import type EffectFlag from './effect-flag';
import type EffectState from './effect-state';
import type Serializable from '../data/serializable';
import type {EffectModifiers} from './modifiers';

export interface EffectInterface extends Serializable {
    ability: Ability | null;

    active: boolean;

    attacker: CharacterInterface | null;

    config: EffectConfig;

    /**
     * Effect flags are completely optional and _arbitrary_ values that you can
     * place in the `flags` array and then read later. By default flags are only
     * used by the `bundle-example-effects` bundle's `effects` command to color
     * an active effect red or green. You can import flags from anywhere you
     * want or simply hard code strings. The EffectFlag enum from src/ is just
     * an _example_ implementation.
     */
    flags: EffectFlag[];

    id: string;

    /**
     * The modifiers property is where you implement formulas for changing
     * character attributes as well as incoming/outgoing damage.
     */
    modifiers: EffectModifiers;

    paused: number | null;

    startedAt: number | null;

    /**
     * State, like quest state, is where you keep track of the current state of
     * the effect. This may include things like how many stacks of this effect
     * there are, the magnitude of an effect, etc. In buff effect a magnitude of
     * 5 indicates that we want to increase the target's attribute by 5
     */
    state: EffectState;
}

export default EffectInterface;
