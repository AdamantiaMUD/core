import ChannelAudience from './channel-audience';
import Player from '../../players/player';

/**
 * Audience class representing characters in the same area as the sender
 */
export class AreaAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        if (!this.sender.room) {
            return [];
        }

        const {area} = this.sender.room;

        return area.getBroadcastTargets().filter(target => target !== this.sender);
    }
}

export default AreaAudience;