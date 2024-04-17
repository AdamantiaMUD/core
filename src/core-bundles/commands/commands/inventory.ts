import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { at, sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';
import ItemUtil from '../../../lib/util/items.js';

export const cmd: CommandDefinitionFactory = {
    name: 'inventory',
    usage: 'inventory',
    aliases: ['i'],
    command:
        (): CommandExecutable =>
        (args: string | null, player: Player): void => {
            if (player.inventory.size === 0) {
                sayAt(player, "You aren't carrying anything.");

                return;
            }

            at(player, 'You are carrying');

            if (isFinite(player.inventory.getMax())) {
                at(
                    player,
                    ` (${player.inventory.size}/${player.inventory.getMax()})`
                );
            }

            sayAt(player, ':');

            // @TODO: Implement grouping
            for (const [, item] of player.inventory.items) {
                sayAt(player, ItemUtil.display(item));
            }
        },
};

export default cmd;
