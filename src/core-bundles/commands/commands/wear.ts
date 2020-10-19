import ArgParser from '../../../lib/commands/arg-parser';
import ItemUtil from '../../../lib/util/items';
import Logger from '../../../lib/common/logger';
import {SlotTakenError} from '../../../lib/equipment/errors';
import {cast, hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Item from '../../../lib/equipment/item';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'wear',
    aliases: ['wield'],
    usage: 'wear <item>',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Wear what?');

            return;
        }

        const item: Item | null = ArgParser.parseDot(args, Array.from(player.inventory.items));

        if (!hasValue(item)) {
            sayAt(player, "You aren't carrying anything like that.");

            return;
        }

        const slot: string | false | null = item.getMeta<string | false>('slot');

        if (slot === false || !hasValue(slot)) {
            sayAt(player, `You can't wear ${ItemUtil.display(item)}.`);

            return;
        }

        if (item.level > player.level) {
            sayAt(player, "You can't use that yet.");

            return;
        }

        try {
            player.equip(item, slot);
        }
        catch (err: unknown) {
            if (err instanceof SlotTakenError) {
                const conflict = player.equipment.get(slot);

                sayAt(player, `You will have to remove ${ItemUtil.display(conflict!)} first.`);

                return;
            }

            Logger.error(cast<Error>(err).message);

            return;
        }

        sayAt(player, `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`);
    },
};

export default cmd;
