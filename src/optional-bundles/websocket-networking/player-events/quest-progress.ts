import {QuestProgressEvent} from '../../../lib/quests/events';

import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {QuestProgressPayload} from '../../../lib/quests/events';

export const evt: PlayerEventListenerDefinition<QuestProgressPayload> = {
    name: QuestProgressEvent.getName(),
    listener: (): PlayerEventListener<QuestProgressPayload> => (player: Player): void => {
        player.socket?.command(
            'sendData',
            'quests',
            player.questTracker.serialize().active
        );
    },
};

export default evt;
