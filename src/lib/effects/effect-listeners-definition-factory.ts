import type EffectListenersDefinition from './effect-listeners-definition.js';
import type GameStateData from '../game-state-data.js';

export type EffectListenersDefinitionFactory = (
    state: GameStateData
) => EffectListenersDefinition;

export default EffectListenersDefinitionFactory;
