import { PlayerQuestCompletedEvent } from '../../../lib/players/events/index.js';
import { hasValue } from '../../../lib/util/functions.js';
import { line, sayAt } from '../../../lib/communication/broadcast.js';

import type Player from '../../../lib/players/player.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type { PlayerQuestCompletedPayload } from '../../../lib/players/events/index.js';

export const evt: PlayerEventListenerDefinition<PlayerQuestCompletedPayload> = {
    name: PlayerQuestCompletedEvent.getName(),
    listener:
        (): PlayerEventListener<PlayerQuestCompletedPayload> =>
        (player: Player, { quest }: PlayerQuestCompletedPayload): void => {
            sayAt(
                player,
                `{yellow.bold Quest Complete: ${quest.config.title}!}`
            );

            if (hasValue(quest.config.completionMessage)) {
                sayAt(player, line(80));
                sayAt(player, quest.config.completionMessage);
            }
        },
};

export default evt;
