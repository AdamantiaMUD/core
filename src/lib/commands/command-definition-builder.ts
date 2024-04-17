import type GameStateData from '../game-state-data.js';

import type CommandDefinition from './command-definition.js';

export type StatefulCommandBuilder = (
    state: GameStateData
) => CommandDefinition;
export type StatelessCommandBuilder = () => CommandDefinition;

export type CommandDefinitionBuilder =
    | StatefulCommandBuilder
    | StatelessCommandBuilder;

export default CommandDefinitionBuilder;
