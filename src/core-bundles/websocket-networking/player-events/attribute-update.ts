import Player from '../../../lib/players/player';
import updateAttributes from '../util/update-attributes';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'attribute-update',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#attributeUpdate
         */
        return (player: Player) => {
            updateAttributes(player);
        };
    },
};

export default evt;
