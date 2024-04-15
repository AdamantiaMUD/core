import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'credits',
    command: (state: GameStateData): CommandExecutable => (args: string | null, player: Player): void => {
        state.commandManager.get('help')?.execute('credits', player);
    },
};

export default cmd;
