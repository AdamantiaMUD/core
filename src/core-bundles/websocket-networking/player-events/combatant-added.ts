import Player from '../../../lib/players/player';
import updateTargets from '../util/update-targets';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'combatant-added',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#combatantAdded
         */
        return (player: Player) => {
            updateTargets(player);
        };
    },
};

export default evt;
