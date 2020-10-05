import {PlayerSaveEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';

import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {PlayerSavePayload} from '../../../lib/players/events';

export const evt: PlayerEventListenerDefinition<PlayerSavePayload> = {
    name: PlayerSaveEvent.getName(),
    listener: (state: GameStateData): PlayerEventListener<PlayerSavePayload> => async (
        player: Player,
        payload: PlayerSavePayload
    ): Promise<void> => {
        await state.playerManager.save(player);

        if (hasValue(payload.callback)) {
            payload.callback();
        }
    },
};

export default evt;
