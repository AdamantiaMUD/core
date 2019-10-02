// import {sprintf} from 'sprintf-js';
//
// import Broadcast from '../../../lib/communication/broadcast';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// import Combat from '../../combat/lib/Combat';
// import PlayerClass from '../../player-classes/lib/PlayerClass';
//
// const {
//     /* eslint-disable-next-line id-length */
//     at,
//     center,
//     line,
//     sayAt,
// } = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'score',
//     aliases: ['stats'],
//     command: () => (args, player) => {
//         const pClass: PlayerClass = player.getMeta('class');
//
//         /* eslint-disable-next-line max-len */
//         sayAt(player, `<b>${center(60, `${player.name}, level ${player.level} ${pClass.config.name}`, 'green')}`);
//         sayAt(player, `<b>${line(60, '-', 'green')}`);
//
//         const stats: {[key: string]: {current: number; base: number; max: number}} = [
//             'ac',
//             'hp',
//             'critical',
//             'str',
//             'dex',
//             'con',
//             'int',
//             'wis',
//             'cha',
//         ].reduce((acc, stat) => ({
//             ...acc,
//             [stat]: {
//                 current: player.getAttribute(stat) || 0,
//                 base: player.getBaseAttribute(stat) || 0,
//                 max: player.getMaxAttribute(stat) || 0,
//             },
//         }), {});
//
//         at(player, sprintf(' %-9s: %12s', 'Health', `${stats.hp.current}/${stats.hp.max}`));
//         sayAt(player, `<b><green>${sprintf(
//             '%36s',
//             'Weapon '
//         )}`);
//
//         at(player, line(24, ' '));
//         sayAt(player, `${sprintf('%35s', `.${line(22)}`)}.`);
//
//         at(player, sprintf('%37s', '|'));
//
//         const weaponDamage = Combat.getWeaponDamage(player);
//
//         sayAt(player, sprintf(' %6s:<b>%5s</b> - <b>%-5s</b> |', 'Damage', weaponDamage.display));
//         at(player, sprintf('%37s', '|'));
//         /* eslint-disable-next-line max-len */
//         sayAt(player, sprintf(' %6s: <b>%12s</b> |', 'Speed', center(12, `${Combat.getWeaponSpeed(player)} sec`)));
//
//         sayAt(player, sprintf('%60s', `'${line(22)}'`));
//
//         sayAt(player, `<b><green>${sprintf(
//             '%-24s',
//             ' Stats'
//         )}</green></b>`);
//         sayAt(player, `.${line(22)}.`);
//
//         const printStat = (stat: string, newline = true): void => {
//             const val = stats[stat];
//             const statColor = val.current > val.base ? 'green' : 'white';
//             const str = sprintf(
//                 `| %-9s : <b><${statColor}>%8s</${statColor}></b> |`,
//                 stat[0].toUpperCase() + stat.slice(1),
//                 val.current
//             );
//
//             if (newline) {
//                 sayAt(player, str);
//             }
//             else {
//                 at(player, str);
//             }
//         };
//
//         printStat('str', false);
//         sayAt(player, `<b><green>${sprintf('%36s', 'Gold ')}`);
//         printStat('dex', false);
//         sayAt(player, sprintf('%36s', `.${line(12)}.`));
//         printStat('con', false);
//         sayAt(player, sprintf('%22s| <b>%10s</b> |', '', player.getMeta('currencies.gold') || 0));
//         printStat('int', false);
//         sayAt(player, sprintf('%36s', `'${line(12)}'`));
//
//         sayAt(player, `:${line(22)}:`);
//         printStat('ac');
//         printStat('critical');
//         sayAt(player, `'${line(22)}'`);
//     },
// };
//
// export default cmd;
