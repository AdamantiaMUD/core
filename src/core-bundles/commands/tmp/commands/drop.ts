// import ArgParser from '../../../lib/commands/arg-parser';
// import Broadcast from '../../../lib/communication/broadcast';
// import ItemUtil from '../../../lib/util/items';
// import Player from '../../../lib/players/player';
// import {CommandDefinitionFactory} from '../../../lib/commands/command';
//
// const {sayAt} = Broadcast;
//
// export const cmd: CommandDefinitionFactory = {
//     name: 'drop',
//     usage: 'drop <item>',
//     command: () => (rawArgs: string, player: Player) => {
//         const args = rawArgs.trim();
//
//         if (!args.length) {
//             sayAt(player, 'Drop what?');
//
//             return;
//         }
//
//         if (!player.room) {
//             sayAt(player, 'You are floating in the nether, it would disappear forever.');
//
//             return;
//         }
//
//         const item = ArgParser.parseDot(args, player.inventory);
//
//         if (!item) {
//             sayAt(player, "You aren't carrying anything like that.");
//
//             return;
//         }
//
//         player.removeItem(item);
//         player.room.addItem(item);
//         player.emit('drop', item);
//         item.emit('drop', player);
//
//         for (const npc of player.room.npcs) {
//             npc.emit('playerDropItem', player, item);
//         }
//
//         sayAt(player, `<green>You dropped: </green>${ItemUtil.display(item)}<green>.</green>`);
//     },
// };
//
// export default cmd;
