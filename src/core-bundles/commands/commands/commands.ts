import Player from '~/lib/players/player';
import {CommandDefinitionFactory} from '~/lib/commands/command';
import {sayAt, sayAtColumns} from '~/lib/communication/broadcast';

export const cmd: CommandDefinitionFactory = {
    name: 'commands',
    aliases: ['channels'],
    command: state => (args, player: Player) => {
        // print standard commands
        sayAt(player, '<b><white>                  Commands</b></white>');
        /* eslint-disable-next-line max-len */
        sayAt(player, '<b><white>===============================================</b></white>');

        const commands = [];

        for (const [name, command] of state.commandManager.commands) {
            if (player.role >= command.requiredRole) {
                commands.push(name);
            }
        }

        commands.sort();
        sayAtColumns(player, commands, 4);

        // channels
        sayAt(player);
        sayAt(player, '<b><white>                  Channels</b></white>');
        /* eslint-disable-next-line max-len */
        sayAt(player, '<b><white>===============================================</b></white>');

        const channelCommands = [];

        for (const [name] of state.channelManager.channels) {
            channelCommands.push(name);
        }

        channelCommands.sort();
        sayAtColumns(player, channelCommands, 4);

        // end with a line break
        sayAt(player, '');
    },
};

export default cmd;
