// import {sprintf} from 'sprintf-js';
//
// import Broadcast from '../../../lib/communication/broadcast';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// /* eslint-disable-next-line id-length */
// const {at, sayAt} = Broadcast;
//
// const sayAtColumns = (source, strings, numCols): void => {
//     // Build a 2D map of strings by col/row
//     let col = 0,
//         row = 0;
//     const perCol = Math.ceil(strings.length / numCols);
//
//     let rowCount = 0;
//     const colWidth = Math.floor((3 * 20) / numCols);
//
//     const columnedStrings = strings.reduce((map, string) => {
//         if (rowCount >= perCol) {
//             rowCount = 0;
//             col += 1;
//         }
//         map[col] = map[col] || [];
//
//         if (!map[col]) {
//             map.push([]);
//         }
//
//         map[col].push(string);
//         rowCount += 1;
//
//         return map;
//     }, []);
//
//     const said = [];
//
//     col = 0;
//     while (said.length < strings.length) {
//         if (columnedStrings[col] && columnedStrings[col][row]) {
//             const string = columnedStrings[col][row];
//
//             said.push(string);
//
//             at(source, sprintf(`%-${colWidth}s`, string));
//         }
//
//         col += 1;
//         if (col === numCols) {
//             sayAt(source);
//             col = 0;
//             row += 1;
//         }
//     }
//
//     // append another line if need be
//     if (col % numCols !== 0) {
//         sayAt(source);
//     }
// };
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'commands',
//     aliases: ['channels'],
//     command: state => (args, player) => {
//         // print standard commands
//         sayAt(player, '<b><white>                  Commands</b></white>');
//         /* eslint-disable-next-line max-len */
//         sayAt(player, '<b><white>===============================================</b></white>');
//
//         const commands = [];
//
//         for (const [name, command] of state.commandManager.commands) {
//             if (player.role >= command.requiredRole) {
//                 commands.push(name);
//             }
//         }
//
//         commands.sort();
//         sayAtColumns(player, commands, 4);
//
//         // channels
//         sayAt(player);
//         sayAt(player, '<b><white>                  Channels</b></white>');
//         /* eslint-disable-next-line max-len */
//         sayAt(player, '<b><white>===============================================</b></white>');
//
//         const channelCommands = [];
//
//         for (const [name] of state.channelManager.channels) {
//             channelCommands.push(name);
//         }
//
//         channelCommands.sort();
//         sayAtColumns(player, channelCommands, 4);
//
//         // end with a line break
//         sayAt(player, '');
//     },
// };
//
// export default cmd;
