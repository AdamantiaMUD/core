import type CommandDefinition from './command-definition';
import type GameStateData from '../game-state-data';

export type CommandDefinitionBuilder = (state?: GameStateData) => CommandDefinition;

export default CommandDefinitionBuilder;
