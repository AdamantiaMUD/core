// import ArgParser from '../../../lib/commands/arg-parser';
// import Broadcast from '../../../lib/communication/broadcast';
// import ItemUtil from '../../../lib/util/items';
// import Logger from '../../../lib/util/logger';
// import Player from '../../../lib/players/player';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// const {EquipSlotTakenError} = EquipErrors;
//
// const {sayAt} = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'wear',
//     aliases: ['wield'],
//     usage: 'wear <item>',
//     command: () => (rawArgs: string, player: Player) => {
//         const arg = rawArgs.trim();
//
//         if (!arg.length) {
//             sayAt(player, 'Wear what?');
//
//             return;
//         }
//
//         const item = ArgParser.parseDot(arg, player.inventory);
//
//         if (!item) {
//             sayAt(player, "You aren't carrying anything like that.");
//
//             return;
//         }
//
//         if (!item.metadata.slot) {
//             sayAt(player, `You can't wear ${ItemUtil.display(item)}.`);
//
//             return;
//         }
//
//         if (item.level > player.level) {
//             sayAt(player, "You can't use that yet.");
//
//             return;
//         }
//
//         try {
//             player.equip(item, item.metadata.slot);
//         }
//         catch (err) {
//             if (err instanceof EquipSlotTakenError) {
//                 const conflict = player.equipment.get(item.metadata.slot);
//
//                 sayAt(player, `You will have to remove ${ItemUtil.display(conflict)} first.`);
//
//                 return;
//             }
//
//             Logger.error(err);
//
//             return;
//         }
//
//         sayAt(player, `<green>You equip:</green> ${ItemUtil.display(item)}<green>.</green>`);
//     },
// };
//
// export default cmd;
