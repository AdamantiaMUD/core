import { sayAt, sayAtColumns } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'commands',
    aliases: ['channels'],
    command:
        (state: GameStateData): CommandExecutable =>
        (args: string | null, player: Player): void => {
            // print standard commands
            sayAt(player, '{white.bold                   Commands}');
            sayAt(
                player,
                '{white.bold ===============================================}'
            );

            const commands: string[] = [];

            for (const [name, command] of state.commandManager.commands) {
                if (player.role >= command.requiredRole) {
                    commands.push(name);
                }
            }

            commands.sort((cmd1: string, cmd2: string) =>
                cmd1.localeCompare(cmd2)
            );
            sayAtColumns(player, commands, 4);

            // channels
            sayAt(player);
            sayAt(player, '{white.bold                   Channels}');
            sayAt(
                player,
                '{white.bold ===============================================}'
            );

            const channelCommands: string[] = [];

            for (const [name] of state.channelManager.channels) {
                channelCommands.push(name);
            }

            channelCommands.sort((cmd1: string, cmd2: string) =>
                cmd1.localeCompare(cmd2)
            );
            sayAtColumns(player, channelCommands, 4);

            // end with a line break
            sayAt(player, '');
        },
};

export default cmd;
