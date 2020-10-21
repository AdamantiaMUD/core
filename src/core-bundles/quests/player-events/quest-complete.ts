import {PlayerQuestCompletedEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';
import {line, sayAt} from '../../../lib/communication/broadcast';

import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {PlayerQuestCompletedPayload} from '../../../lib/players/events';

export const evt: PlayerEventListenerDefinition<PlayerQuestCompletedPayload> = {
    name: PlayerQuestCompletedEvent.getName(),
    listener: (): PlayerEventListener<PlayerQuestCompletedPayload> => (
        player: Player,
        {quest}: PlayerQuestCompletedPayload
    ): void => {
        sayAt(player, `{yellow.bold Quest Complete: ${quest.config.title}!}`);

        if (hasValue(quest.config.completionMessage)) {
            sayAt(player, line(80));
            sayAt(player, quest.config.completionMessage);
        }
    },
};

export default evt;
