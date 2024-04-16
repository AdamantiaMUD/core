import ChannelAudience from './channel-audience.js';

import type Player from '../../players/player.js';

/**
 * Audience class representing everyone in the game, except sender.
 */
export class WorldAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        return (
            this.state?.playerManager.filter(
                (player: Player) => player !== this.sender
            ) ?? []
        );
    }
}

export default WorldAudience;
