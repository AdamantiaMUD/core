import type EffectListenersDefinition from './effect-listeners-definition';
import type GameStateData from '../game-state-data';

export type EffectListenersDefinitionFactory = (state: GameStateData) => EffectListenersDefinition;

export default EffectListenersDefinitionFactory;
