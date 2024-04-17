import ArgParser from '../../../lib/commands/arg-parser.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import { ItemPickedUpEvent } from '../../../lib/equipment/events/index.js';
import ItemType from '../../../lib/equipment/item-type.js';
import type Item from '../../../lib/equipment/item.js';
import { PlayerGetItemEvent } from '../../../lib/players/events/index.js';
import type Player from '../../../lib/players/player.js';
import { hasValue } from '../../../lib/util/functions.js';
import ItemUtil from '../../../lib/util/items.js';

const pickup = (item: Item, container: Item | null, player: Player): void => {
    if (item.getMeta<boolean>('noPickup')) {
        sayAt(player, `${ItemUtil.display(item)} can't be picked up.`);

        return;
    }

    if (hasValue(container)) {
        container.removeItem(item);
    } else {
        player.room!.removeItem(item);
    }

    player.addItem(item);

    sayAt(
        player,
        `{green You receive loot:} ${ItemUtil.display(item)}{green .}`
    );

    item.dispatch(new ItemPickedUpEvent({ character: player }));
    player.dispatch(new PlayerGetItemEvent({ item }));
};

export const cmd: CommandDefinitionFactory = {
    name: 'get',
    usage: 'get <item> [container]',
    aliases: ['take', 'loot'],
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player, alias: string): void => {
            let args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'Get what?');

                return;
            }

            // 'loot' is an alias for 'get all'
            if (alias === 'loot') {
                args = `all ${args}`;
            }

            if (!hasValue(player.room)) {
                sayAt(
                    player,
                    'You are floating in the nether, there is nothing to get.'
                );

                return;
            }

            if (player.inventory.isFull) {
                sayAt(player, "You can't hold any more items.");

                return;
            }

            // get 3.foo from bar -> get 3.foo bar
            const parts = args
                .split(' ')
                .filter((arg: string): boolean => /from/u.exec(arg) === null);

            let source: Item[] = [],
                container: Item | null = null;

            const searchKey = parts[0];
            const containerKey = parts[1];

            if (parts.length === 1) {
                source = Array.from(player.room.items);
            } else {
                /*
                 * Newest containers should go first, so that if you type get all
                 * corpse you get from the most recent corpse. See issue #247.
                 */
                container = ArgParser.parseDot(
                    containerKey,
                    [...player.room.items].reverse()
                );

                if (!hasValue(container)) {
                    sayAt(player, "You don't see anything like that here.");

                    return;
                }

                if (container.type !== ItemType.CONTAINER) {
                    sayAt(
                        player,
                        `${ItemUtil.display(container)} isn't a container.`
                    );

                    return;
                }

                if (container.getMeta<boolean>('closed')) {
                    sayAt(player, `${ItemUtil.display(container)} is closed.`);

                    return;
                }

                source = Array.from(container.inventory?.items.values() ?? []);
            }

            if (searchKey === 'all') {
                if (source.length === 0) {
                    sayAt(player, "There isn't anything to take.");

                    return;
                }

                for (const item of source) {
                    /* eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- The player's inventory may be full after picking up more items */
                    if (player.inventory.isFull) {
                        sayAt(player, "You can't carry any more.");

                        return;
                    }

                    pickup(item, container, player);
                }

                return;
            }

            const item = ArgParser.parseDot(searchKey, source);

            if (!hasValue(item)) {
                sayAt(player, "You don't see anything like that here.");

                return;
            }

            pickup(item, container, player);
        },
};

export default cmd;
