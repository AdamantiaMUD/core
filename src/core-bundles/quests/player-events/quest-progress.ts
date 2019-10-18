import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

export const evt: PlayerEventListenerFactory = {
    name: 'quest-progress',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#questProgress
         */
        return (player: Player, quest: Quest, progress) => {
            sayAt(player, `\r\n<b><yellow>${progress.display}</yellow></b>`);
        };
    },
};

export default evt;
