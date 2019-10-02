import ChannelAudience from './channel-audience';
import Player from '../../players/player';

/**
 * Audience class representing everyone in the game, except sender.
 */
export class WorldAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        return this.state
            .playerManager
            .filter(player => player !== this.sender);
    }
}

export default WorldAudience;
