// import {
//     GameState,
//     Item,
//     Player,
//     PlayerEventListener,
//     PlayerEventListenerFactory,
// } from '@worldofpannotia/ranvier-core';
//
// /* eslint-disable-next-line arrow-body-style */
// export const evt: PlayerEventListenerFactory = (state: GameState): PlayerEventListener => {
//     /**
//      * @listens Player#equip
//      */
//     return (player: Player, slot: string, item: Item) => {
//         if (!item.metadata.stats) {
//             return;
//         }
//
//         const config = {
//             name: `Equip: ${slot}`,
//             type: `equip.${slot}`,
//         };
//
//         const effectState = {
//             slot: slot,
//             stats: item.metadata.stats,
//         };
//
//         player.addEffect(state.EffectFactory.create(
//             'equip',
//             config,
//             effectState
//         ));
//     };
// };
//
// export default evt;
