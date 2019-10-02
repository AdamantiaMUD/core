// import ChannelAudience from './channel-audience';
// import Player from '../../players/player';
//
// /**
//  * Audience class representing other players in the same group as the sender
//  */
// export class PartyAudience extends ChannelAudience {
//     public getBroadcastTargets(): Player[] {
//         if (!this.sender.party) {
//             return [];
//         }
//
//         return this.sender.party
//             .getBroadcastTargets()
//             .filter(player => player !== this.sender);
//     }
// }
//
// export default PartyAudience;
