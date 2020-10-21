import {sprintf} from 'sprintf-js';

import {
    at,
    center,
    line,
    sayAt,
} from '../../../lib/communication/broadcast';
import {getWeaponDamage, getWeaponSpeed} from '../../../lib/util/combat';
import {hasValue} from '../../../lib/util/functions';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type Player from '../../../lib/players/player';
import type PlayerClass from '../../../lib/classes/player-class';

interface PlayerStats {
    [key: string]: {
        base: number;
        current: number;
        max: number;
    };
}

export const cmd: CommandDefinitionFactory = {
    name: 'score',
    aliases: ['stats'],
    command: () => (rawArgs: string, player: Player): void => {
        const pClass = player.getMeta<PlayerClass>('class');

        if (!hasValue(pClass)) {
            return;
        }

        sayAt(player, `{bold ${center(60, `${player.name}, level ${player.level} ${pClass.name}`, 'green')}}`);
        sayAt(player, `{bold ${line(60, '-', 'green')}}`);

        const stats: PlayerStats = [
            'ac',
            'hp',
            'critical',
            'str',
            'dex',
            'con',
            'int',
            'wis',
            'cha',
        ].reduce((acc: PlayerStats, stat: string) => ({
            ...acc,
            [stat]: {
                current: player.getAttribute(stat, 0),
                base: player.getBaseAttribute(stat),
                max: player.getMaxAttribute(stat),
            },
        }), {});

        at(player, sprintf(' %-9s: %12s', 'Health', `${stats.hp.current}/${stats.hp.max}`));
        sayAt(player, `{green.bold ${sprintf('%36s', 'Weapon ')}}`);

        at(player, line(24, ' '));
        sayAt(player, `${sprintf('%35s', `.${line(22)}`)}.`);

        at(player, sprintf('%37s', '|'));

        const weaponDamage = getWeaponDamage(player);

        sayAt(player, sprintf(' %6s:{bold %5s} - {bold %-5s} |', 'Damage', `${weaponDamage.min}-${weaponDamage.max}`));
        at(player, sprintf('%37s', '|'));
        sayAt(player, sprintf(' %6s: {bold %12s} |', 'Speed', center(12, `${getWeaponSpeed(player)} sec`)));
        sayAt(player, sprintf('%60s', `'${line(22)}'`));
        sayAt(player, `{green.bold ${sprintf('%-24s', ' Stats')}}`);
        sayAt(player, `.${line(22)}.`);

        const printStat = (stat: string, newline: boolean = true): void => {
            const val = stats[stat];
            const statColor = val.current > val.base ? 'green' : 'white';
            const str = sprintf(
                `| %-9s : {${statColor}.bold %8s} |`,
                stat[0].toUpperCase() + stat.slice(1),
                val.current
            );

            if (newline) {
                sayAt(player, str);
            }
            else {
                at(player, str);
            }
        };

        printStat('str', false);
        sayAt(player, `{green.bold ${sprintf('%36s', 'Gold ')}}`);
        printStat('dex', false);
        sayAt(player, sprintf('%36s', `.${line(12)}.`));
        printStat('con', false);
        sayAt(player, sprintf('%22s| {bold %10s} |', '', player.getMeta<number>('currencies.gold') ?? 0));
        printStat('int', false);
        sayAt(player, sprintf('%36s', `'${line(12)}'`));
        sayAt(player, `:${line(22)}:`);
        printStat('ac');
        printStat('critical');
        sayAt(player, `'${line(22)}'`);
    },
};

export default cmd;
