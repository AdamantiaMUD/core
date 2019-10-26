import Player from '../../../lib/players/player';
import updateAttributes from '../util/update-attributes';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = {
    name: 'login',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#login
         */
        return (player: Player) => {
            player.socket.command('sendData', 'quests', player.questTracker.serialize().active);

            const effects = player.effects
                .entries()
                .filter(effect => !effect.config.hidden)
                .map(effect => effect.serialize());

            player.socket.command('sendData', 'effects', effects);

            updateAttributes(player);
        };
    },
};

export default evt;
