import ChannelAudience from './channel-audience';
import Character from '../../entities/character';

/**
 * Audience class representing characters in the same area as the sender
 */
export class AreaAudience extends ChannelAudience {
    public getBroadcastTargets(): Character[] {
        if (!this.sender.room) {
            return [];
        }

        const {area} = this.sender.room;

        return area.getBroadcastTargets().filter(target => target !== this.sender);
    }
}

export default AreaAudience;
