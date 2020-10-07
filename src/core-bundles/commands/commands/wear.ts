import ArgParser from '../../../lib/commands/arg-parser';
import Item from '../../../lib/equipment/item';
import ItemUtil from '../../../lib/util/items';
import Logger from '../../../lib/util/logger';
import {sayAt, sayAtColumns} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import {SlotTakenError} from '../../../lib/equipment/errors';

export const cmd: CommandDefinitionFactory = {
    name: 'wear',
    aliases: ['wield'],
    usage: 'wear <item>',
    command: (): CommandExecutable => (rawArgs: string, player: Player) => {
        const arg = rawArgs.trim();

        if (!arg.length) {
            sayAt(player, 'Wear what?');

            return;
        }

        const item: Item = ArgParser.parseDot(arg, player.inventory.items);

        if (!item) {
            sayAt(player, "You aren't carrying anything like that.");

            return;
        }

        const slot: string | false = item.getMeta('slot');

        if (slot === false) {
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
        catch (err) {
            if (err instanceof EquipSlotTakenError) {
                const conflict = player.equipment.get(slot);

                sayAt(player, `You will have to remove ${ItemUtil.display(conflict)} first.`);

                return;
            }

            Logger.error(err);

            return;
        }

        sayAt(player, `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`);
    },
};

export default cmd;
