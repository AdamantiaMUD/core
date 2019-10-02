import ChannelAudience from './channel-audience';
import Character from '../../entities/character';

/**
 * Audience class representing everyone in the game, except sender.
 */
export class WorldAudience extends ChannelAudience {
    public getBroadcastTargets(): Character[] {
        return this.state
            .playerManager
            .filter(player => player !== this.sender);
    }
}

export default WorldAudience;
