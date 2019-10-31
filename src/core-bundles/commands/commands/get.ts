import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Item from '../../../lib/equipment/item';
import ItemType from '../../../lib/equipment/item-type';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';
import {ItemPickedUpEvent} from '../../../lib/equipment/item-events';
import {PlayerGetItemEvent} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

const pickup = (item: Item, container: Item, player: Player): void => {
    if (item.getMeta('noPickup')) {
        sayAt(player, `${ItemUtil.display(item)} can't be picked up.`);

        return;
    }

    if (container) {
        container.removeItem(item);
    }
    else {
        player.room.removeItem(item);
    }

    player.addItem(item);

    sayAt(player, `<green>You receive loot: </green>${ItemUtil.display(item)}<green>.</green>`);

    item.dispatch(new ItemPickedUpEvent({character: player}));
    player.dispatch(new PlayerGetItemEvent({item}));
};

export const cmd: CommandDefinitionFactory = {
    name: 'get',
    usage: 'get <item> [container]',
    aliases: ['take', 'pick', 'loot'],
    command: () => (rawArgs: string, player: Player, alias: string) => {
        if (!rawArgs.length) {
            sayAt(player, 'Get what?');

            return;
        }

        if (!player.room) {
            sayAt(player, 'You are floating in the nether, there is nothing to get.');

            return;
        }

        if (player.inventory.isFull) {
            sayAt(player, "You can't hold any more items.");

            return;
        }

        let args = rawArgs;

        // 'loot' is an alias for 'get all'
        if (alias === 'loot') {
            args = `all ${rawArgs}`.trim();
        }

        // get 3.foo from bar -> get 3.foo bar
        let parts = args.split(' ')
            .filter(arg => !arg.match(/from/u));

        // pick up <item>
        if (parts.length > 1 && parts[0] === 'up') {
            parts = parts.slice(1);
        }

        let source = null,
            search = null,
            container = null;

        if (parts.length === 1) {
            search = parts[0];
            source = player.room.items;
        }
        else {
            /*
             * Newest containers should go first, so that if you type get all
             * corpse you get from the most recent corpse. See issue #247.
             */
            container = ArgParser.parseDot(parts[1], [...player.room.items].reverse());
            if (!container) {
                sayAt(player, "You don't see anything like that here.");

                return;
            }

            if (container.type !== ItemType.CONTAINER) {
                sayAt(player, `${ItemUtil.display(container)} isn't a container.`);

                return;
            }

            if (container.closed) {
                sayAt(player, `${ItemUtil.display(container)} is closed.`);

                return;
            }

            search = parts[0];
            source = container.inventory;
        }

        if (search === 'all') {
            if (!source || ![...source].length) {
                sayAt(player, "There isn't anything to take.");

                return;
            }

            for (let srcItem of source) {
                // account for Set vs Map source
                if (Array.isArray(srcItem)) {
                    srcItem = srcItem[1];
                }

                if (player.inventory.isFull) {
                    sayAt(player, "You can't carry any more.");

                    return;
                }

                pickup(srcItem, container, player);
            }

            return;
        }

        const item = ArgParser.parseDot(search, source);

        if (!item) {
            sayAt(player, "You don't see anything like that here.");

            return;
        }

        pickup(item, container, player);
    },
};

export default cmd;
