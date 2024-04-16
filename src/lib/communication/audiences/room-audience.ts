import ChannelAudience from './channel-audience.js';
import { hasValue } from '../../util/functions.js';

import type Player from '../../players/player.js';

/**
 * Audience class representing other players in the same room as the sender
 * Could even be used to broadcast to NPCs if you want them to pick up on dialogue,
 * just make them broadcastables.
 */
export class RoomAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        if (!hasValue(this.sender?.room)) {
            return [];
        }

        return (
            this.sender?.room
                .getBroadcastTargets()
                .filter((target: Player) => target !== this.sender) ?? []
        );
    }
}

export default RoomAudience;
