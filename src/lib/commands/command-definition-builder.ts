import type CommandDefinition from './command-definition';
import type GameStateData from '../game-state-data';

export type StatefulCommandBuilder = (state: GameStateData) => CommandDefinition;
export type StatelessCommandBuilder = () => CommandDefinition;

export type CommandDefinitionBuilder = StatefulCommandBuilder | StatelessCommandBuilder;

export default CommandDefinitionBuilder;
