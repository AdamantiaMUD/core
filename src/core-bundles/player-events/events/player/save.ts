import GameState from '../../../../lib/game-state';
import Player from '../../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../../lib/events/player-events';

export const evt: PlayerEventListenerFactory = (state: GameState): PlayerEventListener => {
    /**
     * @listens Player#save
     */
    return async (player: Player, callback: Function = null) => {
        await state.playerManager.save(player);

        if (typeof callback === 'function') {
            /* eslint-disable-next-line callback-return */
            callback();
        }
    };
};

export default evt;
