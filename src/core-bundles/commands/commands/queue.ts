import { sprintf } from 'sprintf-js';

import { sayAt } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type Player from '../../../lib/players/player.js';

/**
 * View command queue
 */
export const cmd: CommandDefinitionFactory = {
    name: 'queue',
    aliases: ['pending'],
    usage: 'queue',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            sayAt(player, '{yellow.bold Command Queue:}');

            if (!player.commandQueue.hasPending) {
                sayAt(player, ' -) None.');

                return;
            }

            const commands = player.commandQueue.queue;
            const indexToken = `%${`${commands.length + 1}`.length}s`;

            for (let i = 0; i < commands.length; i++) {
                const command = commands[i];
                const index = sprintf(indexToken, i + 1);
                const ttr = sprintf(
                    '%.1f',
                    player.commandQueue.getTimeTilRun(i)
                );
                let buf = ` ${index}) {white.bold ${command.label}}`;

                buf += ` {yellow ({white.bold ${ttr}s})}`;
                sayAt(player, buf);
            }

            sayAt(
                player,
                '{yellow.bold Use the &quot;flush&quot; command to flush the queue}'
            );
        },
};

export default cmd;
