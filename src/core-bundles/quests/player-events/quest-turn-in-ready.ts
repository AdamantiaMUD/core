import {PlayerQuestTurnInReadyEvent} from '../../../lib/players/events';
import {sayAt} from '../../../lib/communication/broadcast';

import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {PlayerQuestTurnInReadyPayload} from '../../../lib/players/events';

export const evt: PlayerEventListenerDefinition<PlayerQuestTurnInReadyPayload> = {
    name: PlayerQuestTurnInReadyEvent.getName(),
    listener: (): PlayerEventListener<PlayerQuestTurnInReadyPayload> => (
        player: Player,
        {quest}: PlayerQuestTurnInReadyPayload
    ): void => {
        sayAt(player, `{yellow.bold ${quest.config.title} ready to turn in!}`);
    },
};

export default evt;
