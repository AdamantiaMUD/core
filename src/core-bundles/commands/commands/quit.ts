import Broadcast from '../../../lib/communication/broadcast';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt, sayAtExcept} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'quit',
    usage: 'quit',
    command: state => (args, player) => {
        // if (player.isInCombat()) {
        //     sayAt(player, "You're too busy fighting for your life!");
        //
        //     return;
        // }

        player.save(() => {
            sayAt(player, 'Goodbye!');
            sayAtExcept(player.room, `${player.name} disappears.`, player);
            state.playerManager.removePlayer(player, true);
        });
    },
};

export default cmd;
