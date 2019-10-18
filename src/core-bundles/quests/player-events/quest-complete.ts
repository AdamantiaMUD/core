import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {line, sayAt} = Broadcast;

export const evt: PlayerEventListenerFactory = {
    name: 'quest-complete',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#questComplete
         */
        return (player: Player, quest) => {
            sayAt(player, `<b><yellow>Quest Complete: ${quest.config.title}!</yellow></b>`);

            if (quest.config.completionMessage) {
                sayAt(player, line(80));
                sayAt(player, quest.config.completionMessage);
            }
        };
    },
};

export default evt;
