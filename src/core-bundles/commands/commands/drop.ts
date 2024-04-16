import ArgParser from '../../../lib/commands/arg-parser.js';
import ItemUtil from '../../../lib/util/items.js';
import { ItemDroppedEvent } from '../../../lib/equipment/events/index.js';
import { NpcPlayerDropItemEvent } from '../../../lib/mobs/events/index.js';
import { PlayerDropItemEvent } from '../../../lib/players/events/index.js';
import { hasValue } from '../../../lib/util/functions.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'drop',
    usage: 'drop <item>',
    command:
        () =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'Drop what?');

                return;
            }

            if (!hasValue(player.room)) {
                sayAt(
                    player,
                    'You are floating in the nether, it would disappear forever.'
                );

                return;
            }

            const item = ArgParser.parseDot(
                args,
                Array.from(player.inventory.items.entries())
            );

            if (!hasValue(item)) {
                sayAt(player, "You aren't carrying anything like that.");

                return;
            }

            player.removeItem(item);
            player.room.addItem(item);

            player.dispatch(new PlayerDropItemEvent({ item }));
            item.dispatch(new ItemDroppedEvent({ character: player }));

            for (const npc of player.room.npcs) {
                npc.dispatch(new NpcPlayerDropItemEvent({ item, player }));
            }

            sayAt(
                player,
                `{green You dropped:} ${ItemUtil.display(item)}{green .}`
            );
        },
};

export default cmd;
