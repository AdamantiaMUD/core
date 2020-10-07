import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import ItemType from '../../../lib/equipment/item-type';
import ItemUtil from '../../../lib/util/items';
import {CharacterPutItemEvent} from '../../../lib/characters/character-events';
import {ItemPutAwayEvent} from '../../../lib/equipment/item-events';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';

const dot = ArgParser.parseDot;

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'put',
    usage: 'put <item> <container>',
    command: (): CommandExecutable => (rawArgs, player) => {
        const args = rawArgs.trim();

        if (!args.length) {
            sayAt(player, 'Put what where?');

            return;
        }

        // put 3.foo in(to) bar -> put 3.foo bar
        const parts = args.split(' ')
            .filter(arg => !arg.match(/in(to)?/u));

        if (parts.length === 1) {
            sayAt(player, 'Where do you want to put it?');

            return;
        }

        const fromList = player.inventory.items;
        const fromArg = parts[0];
        const toArg = parts[1];
        const item = dot(fromArg, fromList);
        const toContainer = dot(toArg, player.room.items)
                        || dot(toArg, player.inventory.items)
                        || dot(toArg, player.equipment);

        if (!item) {
            sayAt(player, "You don't have that item.");

            return;
        }

        if (!toContainer) {
            sayAt(player, "You don't see anything like that here.");

            return;
        }

        if (toContainer.type !== ItemType.CONTAINER) {
            sayAt(player, `${ItemUtil.display(toContainer)} isn't a container.`);

            return;
        }

        if (toContainer.isInventoryFull()) {
            sayAt(player, `${ItemUtil.display(toContainer)} can't hold any more.`);

            return;
        }

        if (toContainer.closed) {
            sayAt(player, `${ItemUtil.display(toContainer)} is closed.`);

            return;
        }

        player.removeItem(item);
        toContainer.addItem(item);

        /* eslint-disable-next-line max-len */
        sayAt(player, `<green>You put </green>${ItemUtil.display(item)}<green> into </green>${ItemUtil.display(toContainer)}<green>.</green>`);

        item.dispatch(new ItemPutAwayEvent({character: player, container: toContainer}));
        player.dispatch(new CharacterPutItemEvent({container: toContainer, item: item}));
    },
};

export default cmd;
