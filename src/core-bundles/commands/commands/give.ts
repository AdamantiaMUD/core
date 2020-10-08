import ArgParser from '../../../lib/commands/arg-parser';
import ItemUtil from '../../../lib/util/items';
import {hasValue} from '../../../lib/util/functions';
import {isNpc} from '../../../lib/util/characters';
import {sayAt} from '../../../lib/communication/broadcast';

import type CharacterInterface from '../../../lib/characters/character-interface';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';
import type SimpleMap from '../../../lib/util/simple-map';

interface AcceptBehaviorConfig extends SimpleMap {
    items: string[];
}

export const cmd: CommandDefinitionFactory = {
    name: 'give',
    usage: 'give <item> <target>',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Give what to whom?');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(player, 'You are floating in the nether, there is nobody with you.');

            return;
        }

        const [itemKey, recipientName] = args.split(' ')
            .filter((part: string) => part !== 'to');

        if (!hasValue(recipientName)) {
            sayAt(player, 'Who do you want to give it to?');

            return;
        }

        const item = ArgParser.parseDot(itemKey, Array.from(player.inventory.items));

        if (!hasValue(item)) {
            sayAt(player, "You don't have that.");

            return;
        }

        // prioritize players before npcs
        let target: CharacterInterface = ArgParser.parseDot(
            recipientName,
            Array.from(player.room.players)
        ) as CharacterInterface;

        if (!hasValue(target)) {
            target = ArgParser.parseDot(recipientName, Array.from(player.room.npcs)) as CharacterInterface;
        }

        if (!hasValue(target)) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (hasValue(target) && isNpc(target)) {
            const accepts: AcceptBehaviorConfig = target.getBehavior('accepts') as AcceptBehaviorConfig;

            if (!hasValue(accepts) || !accepts.items.includes(item.entityReference!)) {
                sayAt(player, "They don't want that.");

                return;
            }
        }

        if (target === player) {
            /* eslint-disable-next-line max-len */
            sayAt(player, `<green>You move ${ItemUtil.display(item)} from one hand to the other. That was productive.</green>`);

            return;
        }

        if (target.inventory.isFull) {
            sayAt(player, 'They can\'t carry any more.');

            return;
        }

        player.removeItem(item);
        target.addItem(item);

        sayAt(player, `<green>You give <white>${target.name}</white>: ${ItemUtil.display(item)}.</green>`);

        if (!isNpc(target)) {
            sayAt(target as Player, `<green>${player.name} gives you: ${ItemUtil.display(item)}.</green>`);
        }
    },
};

export default cmd;
