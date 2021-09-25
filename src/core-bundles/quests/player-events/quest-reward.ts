import {QuestRewardEvent} from '../../../lib/quests/events';

import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {QuestRewardPayload} from '../../../lib/quests/events';

export const evt: PlayerEventListenerDefinition<QuestRewardPayload> = {
    name: QuestRewardEvent.getName(),
    /* eslint-disable @typescript-eslint/no-unused-vars */
    listener: (): PlayerEventListener<QuestRewardPayload> => (
        player: Player,
        {reward}: QuestRewardPayload
    ): void => {
    /* eslint-enable @typescript-eslint/no-unused-vars */
        /*
         * do stuff when the player receives a quest reward. Generally the Reward instance
         * will emit an event that will be handled elsewhere and display its own message
         * e.g., 'currency' or 'experience'. But if you want to handle that all in one
         * place instead, or you'd like to show some supplemental message you can do that here
         */
    },
};

export default evt;
