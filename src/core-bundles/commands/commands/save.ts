import Broadcast from '../../../lib/communication/broadcast';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'save',
    usage: 'save',
    command: () => (args, player) => {
        player.save(() => {
            sayAt(player, 'Saved.');
        });
    },
};

export default cmd;
