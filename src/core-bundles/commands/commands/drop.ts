import ArgParser from '../../../lib/commands/arg-parser';
import ItemUtil from '../../../lib/util/items';
import {ItemDroppedEvent} from '../../../lib/equipment/events';
import {NpcPlayerDropItemEvent} from '../../../lib/mobs/events';
import {PlayerDropItemEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'drop',
    usage: 'drop <item>',
    command: () => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Drop what?');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(player, 'You are floating in the nether, it would disappear forever.');

            return;
        }

        const item = ArgParser.parseDot(args, Array.from(player.inventory.items.entries()));

        if (!hasValue(item)) {
            sayAt(player, "You aren't carrying anything like that.");

            return;
        }

        player.removeItem(item);
        player.room.addItem(item);

        player.dispatch(new PlayerDropItemEvent({item}));
        item.dispatch(new ItemDroppedEvent({character: player}));

        for (const npc of player.room.npcs) {
            npc.dispatch(new NpcPlayerDropItemEvent({item, player}));
        }

        sayAt(player, `{green You dropped:} ${ItemUtil.display(item)}{green .}`);
    },
};

export default cmd;
