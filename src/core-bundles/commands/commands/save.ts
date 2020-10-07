import Broadcast from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'save',
    usage: 'save',
    command: (): CommandExecutable => (args, player) => {
        player.save(() => {
            sayAt(player, 'Saved.');
        });
    },
};

export default cmd;
