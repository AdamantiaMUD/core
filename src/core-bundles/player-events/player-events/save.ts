import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerSaveEvent, PlayerSavePayload} from '../../../lib/players/player-events';

export const evt: MudEventListenerFactory<PlayerSavePayload> = {
    name: new PlayerSaveEvent().getName(),
    listener: (state: GameState): MudEventListener<PlayerSavePayload> => {
        return async (player: Player, payload) => {
            await state.playerManager.save(player);

            if (typeof payload?.callback === 'function') {
                /* eslint-disable-next-line callback-return */
                payload.callback();
            }
        };
    },
};

export default evt;
