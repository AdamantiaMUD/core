import Broadcast from '../../../lib/communication/broadcast';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

/* eslint-disable-next-line id-length */
const {at, sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'inventory',
    usage: 'inventory',
    command: () => (args: string, player: Player) => {
        if (player.inventory.size === 0) {
            sayAt(player, "You aren't carrying anything.");

            return;
        }

        Broadcast.at(player, 'You are carrying');

        if (isFinite(player.inventory.getMax())) {
            at(player, ` (${player.inventory.size}/${player.inventory.getMax()})`);
        }

        sayAt(player, ':');

        // @TODO: Implement grouping
        for (const [, item] of player.inventory.items) {
            sayAt(player, ItemUtil.display(item));
        }
    },
};

export default cmd;
