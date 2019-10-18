import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

export const evt: PlayerEventListenerFactory = {
    name: 'quest-turn-in-ready',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#questTurnInReady
         */
        return (player: Player, quest) => {
            sayAt(player, `<b><yellow>${quest.config.title} ready to turn in!</yellow></b>`);
        };
    },
};

export default evt;
