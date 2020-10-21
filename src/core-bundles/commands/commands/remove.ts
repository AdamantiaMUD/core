import ArgParser from '../../../lib/commands/arg-parser';
import ItemUtil from '../../../lib/util/items';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'remove',
    aliases: ['unwield', 'unequip'],
    usage: 'remove <item>',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Remove what?');

            return;
        }

        const result = ArgParser.parseDot(args, Array.from(player.equipment), true);

        if (!hasValue(result)) {
            sayAt(player, "You aren't wearing anything like that.");

            return;
        }

        const [slot, item] = result;

        sayAt(player, `{green You un-equip:} ${ItemUtil.display(item)}{green .}`);
        player.unequip(slot);
    },
};

export default cmd;
