import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import {
    type PlayerSavePayload,
    PlayerSaveEvent,
} from '../../../lib/players/events/index.js';
import type Player from '../../../lib/players/player.js';
import { hasValue } from '../../../lib/util/functions.js';

export const evt: PlayerEventListenerDefinition<PlayerSavePayload> = {
    name: PlayerSaveEvent.getName(),
    listener:
        (state: GameStateData): PlayerEventListener<PlayerSavePayload> =>
        async (player: Player, payload: PlayerSavePayload): Promise<void> => {
            await state.playerManager.save(player);

            if (hasValue(payload.callback)) {
                payload.callback();
            }
        },
};

export default evt;
