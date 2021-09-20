import ItemUtil from '../../../lib/util/items';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'equipment',
    aliases: ['worn'],
    usage: 'equipment',
    command: (): CommandExecutable => (rawArgs: string | null, player: Player): void => {
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
