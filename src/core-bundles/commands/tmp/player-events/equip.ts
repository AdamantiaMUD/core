// import GameState from '../../../../lib/game-state';
// import Player from '../../../../lib/players/player';
// import {PlayerEventListener, PlayerEventListenerFactory} from '../../../../lib/events/player-events';
//
// /* eslint-disable-next-line arrow-body-style */
// export const evt: PlayerEventListenerFactory = {
//     name: 'equip',
//     listener: (state: GameState): PlayerEventListener => {
//         /**
//          * @listens Player#equip
//          */
//         return (player: Player, slot: string, item: Item) => {
//             if (!item.metadata.stats) {
//                 return;
//             }
//
//             const config = {
//                 name: `Equip: ${slot}`,
//                 type: `equip.${slot}`,
//             };
//
//             const effectState = {
//                 slot: slot,
//                 stats: item.metadata.stats,
//             };
//
//             player.addEffect(state.effectFactory.create(
//                 'equip',
//                 config,
//                 effectState
//             ));
//         };
//     },
// };
//
// export default evt;
