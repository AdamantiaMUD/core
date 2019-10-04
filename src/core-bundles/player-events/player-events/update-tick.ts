import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {prompt, sayAt, sayAtExcept} = Broadcast;

export const evt: PlayerEventListenerFactory = {
    name: 'update-tick',
    listener: (state: GameState): PlayerEventListener => {
        /**
         * @listens Player#updateTick
         */
        return (player: Player) => {
            if (player.commandQueue.hasPending && player.commandQueue.lagRemaining <= 0) {
                sayAt(player);
                player.commandQueue.execute();
                prompt(player);
            }

            const lastCommandTime = player.getMeta('lastCommandTime') || Infinity;
            const timeSinceLastCommand = Date.now() - lastCommandTime;
            const maxIdleTime = (Math.abs(state.config.get('maxIdleTime')) * 60000) || Infinity;

            if (timeSinceLastCommand > maxIdleTime) {
                player.save(() => {
                    /* eslint-disable-next-line max-len */
                    sayAt(player, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
                    sayAtExcept(player.room, `${player.name} disappears.`, player);

                    Logger.log(`Kicked ${player.name} for being idle.`);

                    state.playerManager.removePlayer(player, true);
                });
            }
        };
    },
};

export default evt;
