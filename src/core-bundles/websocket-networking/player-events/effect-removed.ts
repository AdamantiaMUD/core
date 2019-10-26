import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = {
    name: 'effect-removed',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#effectRemoved
         */
        return (player: Player) => {
            if (!player.effects.size) {
                player.socket.command('sendData', 'effects', []);
            }
        };
    },
};

export default evt;
