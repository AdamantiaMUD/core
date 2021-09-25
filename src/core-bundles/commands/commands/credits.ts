import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'credits',
    command: (state: GameStateData): CommandExecutable => (args: string | null, player: Player): void => {
        state.commandManager.get('help')?.execute('credits', player);
    },
};

export default cmd;
