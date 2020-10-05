/**
 * General functions used across the adamantia bundles
 */
import {sprintf} from 'sprintf-js';

import Broadcast from '../communication/broadcast';
import Item from '../equipment/item';
import ItemQuality from '../equipment/item-quality';
import ItemType from '../equipment/item-type';
import {clone} from './objects';
import {hasValue} from './functions';

import type CharacterInterface from '../characters/character-interface';
import type GameStateData from '../game-state-data';
import type ItemStats from '../equipment/item-stats';
import type Player from '../players/player';

const {line, wrap} = Broadcast;

const qualityColors: {[key in ItemQuality]: [string, string?]} = {
    [ItemQuality.POOR]: ['bold', 'black'],
    [ItemQuality.COMMON]: ['bold', 'white'],
    [ItemQuality.UNCOMMON]: ['bold', 'green'],
    [ItemQuality.RARE]: ['bold', 'blue'],
    [ItemQuality.EPIC]: ['bold', 'magenta'],
    [ItemQuality.LEGENDARY]: ['bold', 'red'],
    [ItemQuality.ARTIFACT]: ['yellow'],
};

export const findCarrier = (item: Item): CharacterInterface | Item | null => {
    let owner = item.carriedBy;

    while (hasValue(owner)) {
        if (!(owner instanceof Item)) {
            return owner;
        }

        if (!hasValue(owner.carriedBy)) {
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
    const colors = qualityColors[item.getMeta<ItemQuality>('quality') ?? ItemQuality.COMMON];
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
export const renderItem = (state: GameStateData, item: Item, player: Player): string => {
    let buf = `${qualityColorize(item, `.${line(38)}.`)}\r\n`;

    buf += `| ${qualityColorize(item, sprintf('%-36s', item.name))} |\r\n`;

    buf += sprintf('| %-36s |\r\n', item.type === ItemType.ARMOR ? 'Armor' : 'Weapon');

    /* eslint-disable-next-line @typescript-eslint/switch-exhaustiveness-check */
    switch (item.type) {
        case ItemType.WEAPON: {
            const max = item.getMeta<number>('maxDamage') ?? Infinity;
            const min = item.getMeta<number>('minDamage') ?? 0;
            const speed = item.getMeta<number>('speed') ?? 1;

            buf += sprintf(
                '| %-18s%18s |\r\n',
                `${min} - ${max} Damage`,
                `Speed ${speed}`
            );

            const dps = ((min + max) / 2) / speed;

            buf += sprintf('| %-36s |\r\n', `(avg. ${dps.toPrecision(2)} damage per second)`);
            break;
        }

        case ItemType.ARMOR: {
            const slot = item.getMeta<string>('slot') ?? 'Unknown slot';

            buf += sprintf(
                '| %-36s |\r\n',
                `${slot[0].toUpperCase()}${slot.slice(1)}`
            );
            break;
        }

        case ItemType.CONTAINER:
            buf += sprintf('| %-36s |\r\n', `Holds ${item.maxItems} items`);
            break;

        /* no default */
    }

    // copy stats to make sure we don't accidentally modify it
    const stats: ItemStats = clone(item.getMeta<ItemStats>('stats') ?? {});

    // always show armor first
    if (hasValue(stats.armor)) {
        buf += sprintf('| %-36s |\r\n', `${stats.armor} Armor`);
        delete stats.armor;
    }

    // non-armor stats
    for (const [stat, value] of Object.entries(stats)) {
        buf += sprintf(
            '| %-36s |\r\n',
            `${value > 0 ? '+' : ''}${value} ${stat[0].toUpperCase()}${stat.slice(1)}`
        );
    }

    const specialEffects = item.getMeta<string[]>('specialEffects') ?? [];

    specialEffects.forEach((effectText: string) => {
        const text = wrap(effectText, 36).split(/\r\n/gu);

        text.forEach((textLine: string) => {
            buf += sprintf('| <b><green>%-36s</green></b> |\r\n', textLine);
        });
    });

    const level = item.getMeta<number>('level');

    if (hasValue(level)) {
        const cantUse = level > player.level ? '<red>%-36s</red>' : '%-36s';

        buf += sprintf(`| ${cantUse} |\r\n`, `Requires Level ${level}`);
    }

    buf += `${qualityColorize(item, `'${line(38)}'`)}\r\n`;

    /*
     * On use
     * const usable = item.getBehavior('usable');
     *
     * if (usable && usable !== true) {
     *     if (usable.spell) {
     *         const useSpell = state.spellManager.get(usable.spell);
     *
     *         if (useSpell) {
     *             useSpell.options = usable.options;
     *             buf += `${wrap(`<b>On Use</b>: ${useSpell.info(useSpell, player)}`, 80)}\r\n`;
     *         }
     *     }
     *
     *     if (usable.effect && usable.config.description) {
     *         buf += `${wrap(`<b>Effect</b>: ${usable.config.description}`, 80)}\r\n`;
     *     }
     *
     *     if (usable.charges) {
     *         buf += `${wrap(`${usable.charges} Charges`, 80)}\r\n`;
     *     }
     * }
     */

    // colorize border according to item quality
    buf = buf.replace(/\|/gu, qualityColorize(item, '|'));

    return buf;
};

const utils = {
    display,
    qualityColorize,
    qualityColors,
    renderItem,
};

export default utils;
