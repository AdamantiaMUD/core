import ArgParser from '../../../lib/commands/arg-parser';
import ItemType from '../../../lib/equipment/item-type';
import ItemUtil from '../../../lib/util/items';
import {CharacterPutItemEvent} from '../../../lib/characters/events';
import {ItemPutAwayEvent} from '../../../lib/equipment/events';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'put',
    usage: 'put <item> <container>',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Put what where?');

            return;
        }

        // put 3.foo in(to) bar -> put 3.foo bar
        const parts = args.split(' ')
            .filter((arg: string) => !hasValue((/^in(?:to)?$/u).exec(arg)));

        if (parts.length === 1) {
            sayAt(player, 'Where do you want to put it?');

            return;
        }

        const fromArg = parts[0];
        const toArg = parts[1];

        const item = ArgParser.parseDot(fromArg, Array.from(player.inventory.items));
        const toContainer = ArgParser.parseDot(toArg, Array.from(player.room?.items ?? []))
            ?? ArgParser.parseDot(toArg, Array.from(player.inventory.items))
            ?? ArgParser.parseDot(toArg, Array.from(player.equipment));

        if (!hasValue(item)) {
            sayAt(player, "You don't have that item.");

            return;
        }

        if (!hasValue(toContainer)) {
            sayAt(player, "You don't see anything like that here.");

            return;
        }

        if (toContainer.type !== ItemType.CONTAINER) {
            sayAt(player, `${ItemUtil.display(toContainer)} isn't a container.`);

            return;
        }

        if (toContainer.inventory?.isFull) {
            sayAt(player, `${ItemUtil.display(toContainer)} can't hold any more.`);

            return;
        }

        if (toContainer.getMeta<boolean>('closed')) {
            sayAt(player, `${ItemUtil.display(toContainer)} is closed.`);

            return;
        }

        player.removeItem(item);
        toContainer.addItem(item);

        sayAt(player, `<green>You put </green>${ItemUtil.display(item)}<green> into </green>${ItemUtil.display(toContainer)}<green>.</green>`);

        item.dispatch(new ItemPutAwayEvent({character: player, container: toContainer}));
        player.dispatch(new CharacterPutItemEvent({container: toContainer, item: item}));
    },
};

export default cmd;
