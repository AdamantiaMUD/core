import ChannelAudience from './channel-audience';
import {hasValue} from '../../util/functions';

import type Player from '../../players/player';

/**
 * Audience class representing characters in the same area as the sender
 */
export class AreaAudience extends ChannelAudience {
    public getBroadcastTargets(): Player[] {
        if (!hasValue(this.sender.room)) {
            return [];
        }

        const {area} = this.sender.room;

        return area.getBroadcastTargets().filter((target: Player) => target !== this.sender);
    }
}

export default AreaAudience;
