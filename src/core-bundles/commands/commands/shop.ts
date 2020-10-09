import {sprintf} from 'sprintf-js';

import ArgParser from '../../../lib/commands/arg-parser';
import Command from '../../../lib/commands/command';
import CommandManager from '../../../lib/commands/command-manager';
import ItemType from '../../../lib/equipment/item-type';
import ItemUtils from '../../../lib/util/items';
import {center, line, sayAt} from '../../../lib/communication/broadcast';
import {hasValue} from '../../../lib/util/functions';

import type CommandDefinition from '../../../lib/commands/command-definition';
import type CommandDefinitionBuilder from '../../../lib/commands/command-definition-builder';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Item from '../../../lib/equipment/item';
import type Npc from '../../../lib/mobs/npc';
import type Player from '../../../lib/players/player';

interface VendorConfig {
    items: {
        [key: string]: {
            cost: number;
            currency: string;
        };
    };
}

const getVendorItems = (state: GameStateData, itemRefs: string[]): Item[] => {
    const items: Item[] = [];

    for (const itemRef of itemRefs) {
        const area = state.areaManager.getAreaByReference(itemRef);

        if (hasValue(area)) {
            const item = state.itemFactory.create(itemRef, area);

            if (hasValue(item)) {
                items.push(item);
            }
        }
    }

    return items;
};

type TellFn = (msg: string) => void;

const genTell = (
    state: GameStateData,
    vendor: Npc,
    player: Player
): TellFn => (message: string): void => {
    state.channelManager.get('tell').send(state, vendor, `${player.name} ${message}`);
};

const friendlyCurrencyName = (currency: string): string => currency
    .replace('_', ' ')
    .replace(/\b\w/gu, str => str.toUpperCase());

const listLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'list',
    command: (rawArgs: string, player: Player, alias: string, vendor: Npc): void => {
        const args = rawArgs.trim();

        const vendorConfig = vendor.getMeta<VendorConfig>('vendor')!;
        const items = getVendorItems(state, Object.keys(vendorConfig.items));
        const tell = genTell(state, vendor, player);

        // show item to player before purchasing
        if (hasValue(args)) {
            const item = ArgParser.parseDot(args, items);

            if (!hasValue(item)) {
                tell("I don't carry that item and no, I won't check in back.");

                return;
            }

            item.hydrate(state);
            const vendorItem = vendorConfig.items[item.entityReference];

            sayAt(player, ItemUtils.renderItem(state, item, player));

            const currency = friendlyCurrencyName(vendorItem.currency);

            sayAt(
                player,
                `Cost: <b><white>[${currency}]</white></b> x ${vendorItem.cost}`
            );

            return;
        }

        // group vendor's items by category then display them
        const itemCategories = {
            [ItemType.POTION]: {
                title: 'Potions',
                items: [],
            },
            [ItemType.ARMOR]: {
                title: 'Armor',
                items: [],
            },
            [ItemType.WEAPON]: {
                title: 'Weapons',
                items: [],
            },
            [ItemType.CONTAINER]: {
                title: 'Containers',
                items: [],
            },
            [ItemType.OBJECT]: {
                title: 'Miscellaneous',
                items: [],
            },
        };

        for (const item of items) {
            itemCategories[item.type].items.push(item);
        }

        for (const [, itemCategory] of Object.entries(ItemType)) {
            const category = itemCategories[itemCategory];

            if (category && category.items.length > 0) {
                sayAt(player, `.${center(78, category.title, 'yellow', '-')}.`);
                for (const item of category.items) {
                    const vendorItem = vendorConfig.items[item.entityReference];

                    const itemName = sprintf('%-48s', `[${item.name}]`);
                    const coloredName = ItemUtils.qualityColorize(item, itemName);

                    const currency = friendlyCurrencyName(vendorItem.currency);
                    const itemCost = sprintf(
                        ' <yellow>|</yellow> <b>%-26s</b>',
                        center(26, `${currency} x ${vendorItem.cost}`)
                    );

                    sayAt(
                        player,
                        `<yellow>|</yellow> ${coloredName}${itemCost}<yellow>|</yellow> `
                    );
                }

                sayAt(player, `'${line(78, '-', 'yellow')}'`);
                sayAt(player);
            }
        }
    },
});

const buyLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'buy',
    command: (args, player, alias, vendor) => {
        const vendorConfig = vendor.getMeta('vendor');
        const tell = genTell(state, vendor, player);

        if (!args || !args.length) {
            tell('Well, what do you want to buy?');

            return;
        }

        const items = getVendorItems(state, vendorConfig.items);
        const item = ArgParser.parseDot(args, items);

        if (!item) {
            tell("I don't carry that item and no, I won't check in back.");

            return;
        }

        const vendorItem = vendorConfig.items[item.entityReference];

        const currencyKey = `currencies.${vendorItem.currency}`;
        const playerCurrency = player.getMeta(currencyKey);
        const itemCurrency = friendlyCurrencyName(vendorItem.currency);

        if (!playerCurrency || playerCurrency < vendorItem.cost) {
            tell(`You can't afford that, it costs ${vendorItem.cost} ${itemCurrency}.`);

            return;
        }

        if (player.inventory.isFull) {
            tell("I don't think you can carry any more.");

            return;
        }

        player.setMeta(currencyKey, playerCurrency - vendorItem.cost);
        item.hydrate(state);
        state.itemManager.add(item);
        player.addItem(item);

        const itemName = ItemUtils.display(item);

        sayAt(
            player,
            sprintf(
                '<green>You spend <b><white>% %</white></b> to purchase %.</green>',
                vendorItem.cost,
                itemCurrency,
                itemName
            )
        );

        player.save();
    },
});

const sellLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'sell',
    command: (args, player, alias, vendor) => {
        const tell = genTell(state, vendor, player);
        const [itemArg, confirm] = args.split(' ');

        if (!args || !args.length) {
            tell('What did you want to sell?');
        }

        const item = ArgParser.parseDot(itemArg, player.inventory.items);

        if (!item) {
            sayAt(player, "You don't have that.");

            return;
        }

        const sellable = item.getMeta('sellable');

        if (!sellable) {
            sayAt(player, "You can't sell that item.");

            return;
        }

        if (!['poor', 'common'].includes(item.metadata.quality || 'common') && confirm !== 'sure') {
            sayAt(player, "To sell higher quality items use '<b>sell <item> sure</b>'.");

            return;
        }

        const currencyKey = `currencies.${sellable.currency}`;

        if (!player.getMeta('currencies')) {
            player.setMeta('currencies', {});
        }
        player.setMeta(currencyKey, (player.getMeta(currencyKey) || 0) + sellable.value);

        const currency = friendlyCurrencyName(sellable.currency);
        const itemName = ItemUtils.display(item);

        sayAt(
            player,
            sprintf(
                '<green>You sell % for <b><white>% %</white></b>.</green>',
                itemName,
                sellable.value,
                currency
            )
        );
        state.itemManager.remove(item);
    },
});

const valueLoader: CommandDefinitionBuilder = (state: GameStateData): CommandDefinition => ({
    name: 'value',
    aliases: ['appraise', 'offer'],
    command: (args, player, alias, vendor) => {
        const tell = genTell(state, vendor, player);

        if (!args || !args.length) {
            tell('What did you want me to appraise?');

            return;
        }

        const [itemArg] = args.split(' ');
        const targetItem = ArgParser.parseDot(itemArg, player.inventory.items);

        if (!targetItem) {
            sayAt(player, "You don't have that.");

            return;
        }

        const sellable = targetItem.getMeta('sellable');

        if (!sellable) {
            sayAt(player, "You can't sell that item.");

            return;
        }

        const currency = friendlyCurrencyName(sellable.currency);
        const itemName = ItemUtils.display(targetItem);

        tell(sprintf(
            'I could give you <b><white>% %</white></b> for %.</green>',
            sellable.value,
            currency,
            itemName
        ));
    },
});

export const cmd: CommandDefinitionFactory = {
    name: 'shop',
    aliases: [
        'vendor',
        'list',
        'buy',
        'sell',
        'value',
        'appraise',
        'offer',
    ],
    usage: 'list [search], buy <item>, sell <item>, appraise <item>',
    command: (state: GameStateData): CommandExecutable => {
        const subcommands = new CommandManager();

        subcommands.add(new Command('vendor-npcs', 'list', listLoader(state), ''));
        subcommands.add(new Command('vendor-npcs', 'buy', buyLoader(state), ''));
        subcommands.add(new Command('vendor-npcs', 'sell', sellLoader(state), ''));
        subcommands.add(new Command('vendor-npcs', 'value', valueLoader(state), ''));

        return (rawArgs: string, player: Player, alias: string) => {
            // if list/buy aliases were used then prepend that to the args
            const args = (['vendor', 'shop'].includes(alias) ? '' : `${alias} `) + rawArgs;

            const vendor = Array.from(player.room.npcs)
                .find((npc: Npc) => npc.getMeta('vendor'));

            if (!vendor) {
                sayAt(player, "You aren't in a shop.");

                return;
            }

            const [command, ...commandArgs] = args.split(' ');
            const subcommand = subcommands.find(command);

            if (!hasValue(subcommand)) {
                sayAt(player, "Not a valid shop command. See '<b>help shops</b>'");

                return;
            }

            subcommand.execute(commandArgs.join(' '), player, alias, vendor);
        };
    },
};

export default cmd;
