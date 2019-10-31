import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';
import {ItemDroppedEvent} from '../../../lib/equipment/item-events';
import {PlayerDropItemEvent} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'drop',
    usage: 'drop <item>',
    command: () => (rawArgs: string, player: Player) => {
        const args = rawArgs.trim();

        if (!args.length) {
            sayAt(player, 'Drop what?');

            return;
        }

        if (!player.room) {
            sayAt(player, 'You are floating in the nether, it would disappear forever.');

            return;
        }

        const item = ArgParser.parseDot(args, player.inventory.items);

        if (!item) {
            sayAt(player, "You aren't carrying anything like that.");

            return;
        }

        player.removeItem(item);
        player.room.addItem(item);

        player.dispatch(new PlayerDropItemEvent({item}));
        item.dispatch(new ItemDroppedEvent({character: player}));

        for (const npc of player.room.npcs) {
            npc.emit('player-drop-item', player, item);
        }

        sayAt(player, `<green>You dropped: </green>${ItemUtil.display(item)}<green>.</green>`);
    },
};

export default cmd;
