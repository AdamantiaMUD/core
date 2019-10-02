// import ArgParser from '../../../lib/commands/arg-parser';
// import Broadcast from '../../../lib/communication/broadcast';
// import ItemUtil from '../../../lib/util/items';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// const {sayAt} = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'remove',
//     aliases: ['unwield', 'unequip'],
//     usage: 'remove <item>',
//     command: () => (arg, player) => {
//         if (!arg.length) {
//             sayAt(player, 'Remove what?');
//
//             return;
//         }
//
//         const result = ArgParser.parseDot(arg, player.equipment, true);
//
//         if (!result) {
//             sayAt(player, "You aren't wearing anything like that.");
//
//             return;
//         }
//
//         const [slot, item] = result;
//
//         sayAt(player, `<green>You un-equip: </green>${ItemUtil.display(item)}<green>.</green>`);
//         player.unequip(slot);
//     },
// };
//
// export default cmd;