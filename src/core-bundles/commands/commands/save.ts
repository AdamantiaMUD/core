import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'save',
    usage: 'save',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            player.save(() => {
                sayAt(player, 'Saved.');
            });
        },
};

export default cmd;
