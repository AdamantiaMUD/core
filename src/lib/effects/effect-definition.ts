import type SimpleMap from '../util/simple-map.js';

import type EffectConfig from './effect-config.js';
import type EffectFlag from './effect-flag.js';
import type EffectListenersDefinitionFactory from './effect-listeners-definition-factory.js';
import type EffectListenersDefinition from './effect-listeners-definition.js';
import type { EffectModifiers } from './modifiers/index.js';

export interface EffectDefinition {
    config: EffectConfig;
    flags?: EffectFlag[];
    listeners?: EffectListenersDefinition | EffectListenersDefinitionFactory;
    modifiers?: EffectModifiers;
    state?: SimpleMap;
}

export default EffectDefinition;
