/**
 * General functions used across the adamantia bundles
 */
import {sprintf} from 'sprintf-js';

import Broadcast from '../communication/broadcast';
import Character from '../characters/character';
import GameState from '../game-state';
import Item from '../equipment/item';
import ItemType from '../equipment/item-type';
import Player from '../players/player';

const {line, wrap} = Broadcast;

const qualityColors = {
    poor: ['bold', 'black'],
    common: ['bold', 'white'],
    uncommon: ['bold', 'green'],
    rare: ['bold', 'blue'],
    epic: ['bold', 'magenta'],
    legendary: ['bold', 'red'],
    artifact: ['yellow'],
};

export const findCarrier = (item: Item): Character | Item => {
    let owner = item.carriedBy;

    while (owner) {
        if (!(owner instanceof Item)) {
            return owner;
        }

        if (!owner.carriedBy) {
            return owner;
        }

        owner = owner.carriedBy;
    }

    return null;
};

/**
 * Colorize the given string according to this item's quality
 */
export const qualityColorize = (item: Item, string: string): string => {
    const colors = qualityColors[item.getMeta('quality') || 'common'];
    const open = `<${colors.join('><')}>`;
    const close = `</${colors.reverse().join('></')}>`;

    return open + string + close;
};

/**
 * Friendly display colorized by quality
 */
export const display = (item: Item): string => qualityColorize(item, `[${item.name}]`);

/**
 * Render a pretty display of an item
 */
export const renderItem = (state: GameState, item: Item, player: Player): string => {
    let buf = `${qualityColorize(item, `.${line(38)}.`)}\r\n`;

    buf += `| ${qualityColorize(item, sprintf('%-36s', item.name))} |\r\n`;

    buf += sprintf('| %-36s |\r\n', item.type === ItemType.ARMOR ? 'Armor' : 'Weapon');

    switch (item.type) {
        case ItemType.WEAPON: {
            buf += sprintf(
                '| %-18s%18s |\r\n',
                `${item.getMeta('minDamage')} - ${item.getMeta('maxDamage')} Damage`,
                `Speed ${item.getMeta('speed')}`
            );

            const dps = ((item.getMeta('minDamage') + item.getMeta('maxDamage')) / 2) / item.getMeta('speed');

            buf += sprintf('| %-36s |\r\n', `(${dps.toPrecision(2)} damage per second)`);
            break;
        }

        case ItemType.ARMOR:
            buf += sprintf(
                '| %-36s |\r\n',
                item.getMeta('slot')[0].toUpperCase() + item.getMeta('slot').slice(1)
            );
            break;

        case ItemType.CONTAINER:
            buf += sprintf('| %-36s |\r\n', `Holds ${item.maxItems} items`);
            break;

        /* no default */
    }

    // copy stats to make sure we don't accidentally modify it
    const stats = {...item.getMeta('stats')};

    // always show armor first
    if (stats.armor) {
        buf += sprintf('| %-36s |\r\n', `${stats.armor} Armor`);
        delete stats.armor;
    }

    // non-armor stats
    for (const stat in stats) {
        const value = stats[stat];

        buf += sprintf(
            '| %-36s |\r\n',
            `${(value > 0 ? '+' : '') + value} ${stat[0].toUpperCase()}${stat.slice(1)}`
        );
    }

    // custom special effect rendering
    if (item.getMeta('specialEffects')) {
        item.getMeta('specialEffects').forEach(effectText => {
            const text = wrap(effectText, 36).split(/\r\n/gu);

            text.forEach(textLine => {
                buf += sprintf('| <b><green>%-36s</green></b> |\r\n', textLine);
            });
        });
    }

    if (item.getMeta('level')) {
        const cantUse = item.getMeta('level') > player.level ? '<red>%-36s</red>' : '%-36s';

        buf += sprintf(`| ${cantUse} |\r\n`, `Requires Level ${item.getMeta('level')}`);
    }

    buf += `${qualityColorize(item, `'${line(38)}'`)}\r\n`;

    // On use
    // const usable = item.getBehavior('usable');
    //
    // if (usable && usable !== true) {
    //     if (usable.spell) {
    //         const useSpell = state.spellManager.get(usable.spell);
    //
    //         if (useSpell) {
    //             useSpell.options = usable.options;
    //             buf += `${wrap(`<b>On Use</b>: ${useSpell.info(useSpell, player)}`, 80)}\r\n`;
    //         }
    //     }
    //
    //     if (usable.effect && usable.config.description) {
    //         buf += `${wrap(`<b>Effect</b>: ${usable.config.description}`, 80)}\r\n`;
    //     }
    //
    //     if (usable.charges) {
    //         buf += `${wrap(`${usable.charges} Charges`, 80)}\r\n`;
    //     }
    // }

    // colorize border according to item quality
    buf = buf.replace(/\|/gu, qualityColorize(item, '|'));

    return buf;
};

export default {
    display,
    qualityColorize,
    qualityColors,
    renderItem,
};
