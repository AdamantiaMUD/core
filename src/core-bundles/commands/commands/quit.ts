import Broadcast from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';

const {sayAt, sayAtExcept} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'quit',
    usage: 'quit',
    command: (state): CommandExecutable => (args, player) => {
        if (player.combat.isFighting()) {
            sayAt(player, "You're too busy fighting for your life!");

            return;
        }

        player.save(() => {
            sayAt(player, 'Goodbye!');
            sayAtExcept(player.room, `${player.name} disappears.`, player);

            state.playerManager.removePlayer(player, true);
        });
    },
};

export default cmd;
