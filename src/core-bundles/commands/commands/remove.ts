import ArgParser from '../../../lib/commands/arg-parser.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';
import { hasValue } from '../../../lib/util/functions.js';
import ItemUtil from '../../../lib/util/items.js';

export const cmd: CommandDefinitionFactory = {
    name: 'remove',
    aliases: ['unwield', 'unequip'],
    usage: 'remove <item>',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'Remove what?');

                return;
            }

            const result = ArgParser.parseDot(
                args,
                Array.from(player.equipment),
                true
            );

            if (!hasValue(result)) {
                sayAt(player, "You aren't wearing anything like that.");

                return;
            }

            const [slot, item] = result;

            sayAt(
                player,
                `{green You un-equip:} ${ItemUtil.display(item)}{green .}`
            );
            player.unequip(slot);
        },
};

export default cmd;
