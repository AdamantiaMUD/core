import Player from '../../../lib/players/player';
import SimpleMap from '../../../lib/util/simple-map';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = {
    name: 'quest-reward',
    listener: (): PlayerEventListener => {
        /* eslint-disable @typescript-eslint/no-unused-vars */
        /**
         * @listens Player#questReward
         */
        return (player: Player, reward: SimpleMap) => {
            /*
             * do stuff when the player receives a quest reward. Generally the Reward instance
             * will emit an event that will be handled elsewhere and display its own message
             * e.g., 'currency' or 'experience'. But if you want to handle that all in one
             * place instead, or you'd like to show some supplemental message you can do that here
             */
        };
        /* eslint-enable @typescript-eslint/no-unused-vars */
    },
};

export default evt;
