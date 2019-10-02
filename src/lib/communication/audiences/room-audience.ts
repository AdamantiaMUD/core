import ChannelAudience from './channel-audience';
import Player from '../../players/player';

/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 */
export class RoomAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        return this.sender.room
            .getBroadcastTargets()
            .filter(target => target !== this.sender);
    }
}

export default RoomAudience;
