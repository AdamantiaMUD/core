import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';

/**
 * Flush the command queue
 */
export const cmd: CommandDefinitionFactory = {
    name: 'flush',
    usage: 'flush',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            player.commandQueue.flush();
            sayAt(player, '{yellow.bold Queue flushed.}');
        },
};

export default cmd;
