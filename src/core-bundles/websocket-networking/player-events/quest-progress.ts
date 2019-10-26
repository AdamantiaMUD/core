import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = {
    name: 'quest-progress',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#questProgress
         */
        return (player: Player) => {
            player.socket.command(
                'sendData',
                'quests',
                player.questTracker.serialize().active
            );
        };
    },
};

export default evt;
