import GameStateData from '~/lib/game-state-data';
import Player from '~/lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '~/lib/events/mud-event';
import {PlayerSaveEvent, PlayerSavePayload} from '~/lib/players/player-events';

export const evt: MudEventListenerFactory<PlayerSavePayload> = {
    name: PlayerSaveEvent.getName(),
    listener: (state: GameState): MudEventListener<PlayerSavePayload> => async (
        player: Player,
        payload: PlayerSavePayload
    ): Promise<void> => {
        await state.playerManager.save(player);

        if (typeof payload?.callback === 'function') {
            /* eslint-disable-next-line callback-return */
            payload.callback();
        }
    },
};

export default evt;
