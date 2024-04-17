import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';
import ItemUtil from '../../../lib/util/items.js';

export const cmd: CommandDefinitionFactory = {
    name: 'equipment',
    aliases: ['worn'],
    usage: 'equipment',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            if (player.equipment.size === 0) {
                sayAt(player, 'You are completely naked!');

                return;
            }

            sayAt(player, 'Currently Equipped:');

            for (const [slot, item] of player.equipment) {
                sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
            }
        },
};

export default cmd;
