// import Broadcast from '../../../lib/communication/broadcast';
// import Command, {
//     CommandDefinition,
//     CommandDefinitionBuilder,
//     CommandDefinitionFactory
// } from '../../../lib/commands/command';
// import CommandManager from '../../../lib/commands/command-manager';
// import Player from '../../../lib/players/player';
// import {SimpleMap} from '../../../../index';
//
// const {sayAt} = Broadcast;
//
// const getAliases = (player: Player): SimpleMap => {
//     let aliases = player.getMeta('aliases');
//
//     if (!aliases) {
//         aliases = {};
//     }
//
//     // add more checks here later for other forms of bad data
//
//     player.setMeta('aliases', aliases);
//
//     return aliases;
// };
//
// const addLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
//     name: 'add',
//     command: (args, player) => {
//         const aliases = getAliases(player);
//         const [key, value] = args.split(' ');
//
//         aliases[key] = value;
//
//         player.setMeta('aliases', aliases);
//
//         sayAt(player, `You have added a new alias "${key}" for "${value}".`);
//     },
// });
//
// const checkLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
//     name: 'check',
//     command: (key, player) => {
//         const aliases = getAliases(player);
//         const value = aliases[key];
//
//         if (value) {
//             sayAt(player, `{${key}} : {${value}}`);
//         }
//         else {
//             sayAt(player, `You have no alias for "${key}".`);
//         }
//     },
// });
//
// const listLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
//     name: 'list',
//     command: (args, player) => {
//         const aliases = getAliases(player);
//
//         // if a player has any aliases, iterate over them, echoing every single one
//         if (Object.keys(aliases).length === 0) {
//             sayAt(player, 'You have no aliases set.');
//
//             return;
//         }
//
//         for (const [key, value] of Object.entries(aliases)) {
//             sayAt(player, `{${key}} : {${value}}`);
//         }
//     },
// });
//
// const removeLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
//     name: 'remove',
//     command: (key, player) => {
//         const aliases = getAliases(player);
//
//         if (aliases[key]) {
//             const value = aliases[key];
//
//             delete aliases[key];
//
//             sayAt(player, `You have removed alias "${key}" for "${value}".`);
//         }
//         else {
//             sayAt(player, `You have no alias set for "${key}". It is already clear.`);
//         }
//
//         player.setMeta('aliases', aliases);
//     },
// });
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'alias',
//     usage: 'alias add <key> <command>, alias check <key>, alias remove <key>, alias list',
//     command: () => {
//         const subcommands = new CommandManager();
//
//         subcommands.add(new Command('command-aliases', 'add', addLoader(), ''));
//         subcommands.add(new Command('command-aliases', 'check', checkLoader(), ''));
//         subcommands.add(new Command('command-aliases', 'list', listLoader(), ''));
//         subcommands.add(new Command('command-aliases', 'remove', removeLoader(), ''));
//
//         return (args: string, player: Player) => {
//             const [command, ...commandArgs] = args.split(' ');
//
//             let subcommand = subcommands.get('list');
//
//             if (command) {
//                 subcommand = subcommands.find(command);
//             }
//
//             if (!subcommand) {
//                 sayAt(player, 'Not a valid alias command. See "help alias".');
//
//                 return;
//             }
//
//             subcommand.execute(commandArgs.join(' '), player);
//         };
//     },
// };
//
// export default cmd;
