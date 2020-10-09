import {sprintf} from 'sprintf-js';

import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

/**
 * View command queue
 */
export const cmd: CommandDefinitionFactory = {
    name: 'queue',
    aliases: ['pending'],
    usage: 'queue',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        sayAt(player, '<b><yellow>Command Queue:</yellow></b>');

        if (!player.commandQueue.hasPending) {
            sayAt(player, ' -) None.');

            return;
        }

        const commands = player.commandQueue.queue;
        const indexToken = `%${`${commands.length + 1}`.length}s`;

        for (let i = 0; i < commands.length; i++) {
            const command = commands[i];
            const index = sprintf(indexToken, i + 1);
            const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(i));
            let buf = ` ${index}) <b><white>${command.label}</white></b>`;

            buf += ` <yellow>(</yellow><b><white>${ttr}s</white></b><yellow>)</yellow>`;
            sayAt(player, buf);
        }

        sayAt(player, '<b><yellow>Use the &quot;flush&quot; command to flush the queue</yellow></b>');
    },
};

export default cmd;
