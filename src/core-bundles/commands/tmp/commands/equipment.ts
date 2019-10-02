// import Broadcast from '../../../lib/communication/broadcast';
// import ItemUtil from '../../../lib/util/items';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// const {sayAt} = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'equipment',
//     aliases: ['worn'],
//     usage: 'equipment',
//     command: () => (args, player) => {
//         if (!player.equipment.size) {
//             sayAt(player, 'You are completely naked!');
//
//             return;
//         }
//
//         sayAt(player, 'Currently Equipped:');
//
//         for (const [slot, item] of player.equipment) {
//             sayAt(player, `  <${slot}> ${ItemUtil.display(item)}`);
//         }
//     },
// };
//
// export default cmd;
