import type GameStateData from '../game-state-data.js';

import type EffectListenersDefinition from './effect-listeners-definition.js';

export type EffectListenersDefinitionFactory = (
    state: GameStateData
) => EffectListenersDefinition;

export default EffectListenersDefinitionFactory;
