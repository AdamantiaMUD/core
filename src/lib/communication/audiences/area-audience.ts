import ChannelAudience from './channel-audience';
import {hasValue} from '../../util/functions';

import type Broadcastable from '../broadcastable';

/**
 * Audience class representing characters in the same area as the sender
 */
export class AreaAudience extends ChannelAudience {
    public getBroadcastTargets(): Broadcastable[] {
        if (!hasValue(this.sender?.room)) {
            return [];
        }

        const {area} = this.sender!.room;

        return area.getBroadcastTargets().filter((target: Broadcastable) => target !== this.sender);
    }
}

export default AreaAudience;
