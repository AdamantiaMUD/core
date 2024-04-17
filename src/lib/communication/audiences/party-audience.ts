import type Player from '../../players/player.js';
import { hasValue } from '../../util/functions.js';

import ChannelAudience from './channel-audience.js';

/**
 * Audience class representing other players in the same group as the sender
 */
export class PartyAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        if (!hasValue((this.sender as Player).party)) {
            return [];
        }

        return (this.sender as Player)
            .party!.getBroadcastTargets()
            .filter((player: Player) => player !== this.sender);
    }
}

export default PartyAudience;
