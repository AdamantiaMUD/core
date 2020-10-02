import type EffectFlag from './effect-flag';
import type EffectListenersDefinition from './effect-listeners-definition';
import type EffectListenersDefinitionFactory from './effect-listeners-definition-factory';
import type SimpleMap from '../util/simple-map';
import type {EffectConfig} from './effect';
import type {EffectModifiers} from './effect-modifiers';

export interface EffectDefinition {
    config: EffectConfig;
    flags?: EffectFlag[];
    listeners?: EffectListenersDefinition | EffectListenersDefinitionFactory;
    modifiers?: EffectModifiers;
    state?: SimpleMap;
}

export default EffectDefinition;
