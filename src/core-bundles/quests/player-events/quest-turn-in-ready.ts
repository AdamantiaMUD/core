import { PlayerQuestTurnInReadyEvent } from '../../../lib/players/events/index.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type Player from '../../../lib/players/player.js';
import type { PlayerQuestTurnInReadyPayload } from '../../../lib/players/events/index.js';

export const evt: PlayerEventListenerDefinition<PlayerQuestTurnInReadyPayload> =
    {
        name: PlayerQuestTurnInReadyEvent.getName(),
        listener:
            (): PlayerEventListener<PlayerQuestTurnInReadyPayload> =>
            (
                player: Player,
                { quest }: PlayerQuestTurnInReadyPayload
            ): void => {
                sayAt(
                    player,
                    `{yellow.bold ${quest.config.title} ready to turn in!}`
                );
            },
    };

export default evt;
