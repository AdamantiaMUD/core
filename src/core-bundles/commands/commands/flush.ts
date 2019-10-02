import Broadcast from '../../../lib/communication/broadcast';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

/**
 * Flush the command queue
 */
export const cmd: CommandDefinitionFactory = {
    name: 'flush',
    usage: 'flush',
    command: () => (args, player) => {
        player.commandQueue.flush();
        sayAt(player, '<b><yellow>Queue flushed.</yellow></b>');
    },
};

export default cmd;
