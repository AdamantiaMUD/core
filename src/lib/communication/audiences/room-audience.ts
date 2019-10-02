import ChannelAudience from './channel-audience';
import Character from '../../entities/character';

/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 */
export class RoomAudience extends ChannelAudience {
    public getBroadcastTargets(): Character[] {
        return this.sender.room
            .getBroadcastTargets()
            .filter(target => target !== this.sender);
    }
}

export default RoomAudience;
