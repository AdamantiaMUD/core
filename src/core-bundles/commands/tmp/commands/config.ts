// import Broadcast from '../../../lib/communication/broadcast';
// import Player from '../../../lib/players/player';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// const {sayAt} = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'config',
//     usage: 'config <set/list> [setting] [value]',
//     aliases: ['toggle', 'options', 'set'],
//     command: state => (args: string, player: Player) => {
//         if (!args.length) {
//             sayAt(player, 'Configure what?');
//
//             state.commandManager.get('help').execute('config', player);
//
//             return;
//         }
//
//         const possibleCommands = ['set', 'list'];
//
//         const [command, configToSet, valueToSet] = args.split(' ');
//
//         if (!possibleCommands.includes(command)) {
//             sayAt(player, `<red>Invalid config command: ${command}</red>`);
//
//             state.commandManager.get('help').execute('config', player);
//
//             return;
//         }
//
//         if (command === 'list') {
//             sayAt(player, 'Current Settings:');
//
//             for (const key in player.metadata.config) {
//                 if (Object.prototype.hasOwnProperty.call(player.metadata.config, key)) {
//                     const val = player.metadata.config[key] ? 'on' : 'off';
//
//                     sayAt(player, `  ${key}: ${val}`);
//                 }
//             }
//
//             return;
//         }
//
//         if (!configToSet) {
//             sayAt(player, 'Set what?');
//
//             state.commandManager.get('help').execute('config', player);
//
//             return;
//         }
//
//         const possibleSettings = ['brief', 'autoloot', 'minimap'];
//
//         if (!possibleSettings.includes(configToSet)) {
//             /* eslint-disable-next-line max-len */
//             sayAt(player, `<red>Invalid setting: ${configToSet}. Possible settings: ${possibleSettings.join(', ')}`);
//
//             state.commandManager.get('help').execute('config', player);
//
//             return;
//         }
//
//         if (!valueToSet) {
//             sayAt(player, `<red>What value do you want to set for ${configToSet}?</red>`);
//
//             state.commandManager.get('help').execute('config', player);
//
//             return;
//         }
//
//         /* eslint-disable-next-line id-length */
//         const possibleValues = {on: true, off: false};
//
//         if (possibleValues[valueToSet] === undefined) {
//             sayAt(player, '<red>Value must be either: on / off</red>');
//
//             return;
//         }
//
//         if (!player.getMeta('config')) {
//             player.setMeta('config', {});
//         }
//
//         player.setMeta(`config.${configToSet}`, possibleValues[valueToSet]);
//
//         sayAt(player, 'Configuration value saved');
//     },
// };
//
// export default cmd;
