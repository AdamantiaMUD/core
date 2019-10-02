import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/entities/character';
import ItemUtil from '../../../lib/util/items';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const dot = ArgParser.parseDot;

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'give',
    usage: 'give <item> <target>',
    command: () => (args: string, player: Player) => {
        if (!args || !args.length) {
            sayAt(player, 'Give what to whom?');

            return;
        }

        /* eslint-disable-next-line prefer-const */
        let [itemKey, recipientName] = args.split(' ');

        // give foo to bar
        if (recipientName === 'to') {
            recipientName = args.split(' ')[2];
        }

        if (!recipientName) {
            sayAt(player, 'Who do you want to give it to?');

            return;
        }

        const item = dot(itemKey, player.inventory) as Item;

        if (!item) {
            sayAt(player, 'You don\'t have that.');

            return;
        }

        // prioritize players before npcs
        let target = dot(recipientName, player.room.players) as Character;

        if (!target) {
            target = dot(recipientName, player.room.npcs);

            if (target) {
                /* eslint-disable-next-line no-extra-parens */
                const accepts = (target as Npc).getBehavior('accepts');

                if (!accepts || !accepts.includes(item.entityReference)) {
                    sayAt(player, 'They don\'t want that.');

                    return;
                }
            }
        }

        if (!target) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (target === player) {
            /* eslint-disable-next-line max-len */
            sayAt(player, `<green>You move ${ItemUtil.display(item)} from one hand to the other. That was productive.</green>`);

            return;
        }

        if (target.isInventoryFull()) {
            sayAt(player, 'They can\'t carry any more.');

            return;
        }

        player.removeItem(item);
        target.addItem(item);

        /* eslint-disable-next-line max-len */
        sayAt(player, `<green>You give <white>${target.name}</white>: ${ItemUtil.display(item)}.</green>`);

        if (!target.isNpc) {
            sayAt(target, `<green>${player.name} gives you: ${ItemUtil.display(item)}.</green>`);
        }
    },
};

export default cmd;
