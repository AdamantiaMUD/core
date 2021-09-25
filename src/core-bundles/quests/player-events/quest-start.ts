import {PlayerQuestStartedEvent} from '../../../lib/players/events';
import {center, line, sayAt} from '../../../lib/communication/broadcast';
import {hasValue} from '../../../lib/util/functions';

import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {PlayerQuestStartedPayload} from '../../../lib/players/events';

export const evt: PlayerEventListenerDefinition<PlayerQuestStartedPayload> = {
    name: PlayerQuestStartedEvent.getName(),
    listener: (state: GameStateData): PlayerEventListener<PlayerQuestStartedPayload> => (
        player: Player,
        {quest}: PlayerQuestStartedPayload
    ): void => {
        sayAt(player, `{yellow.bold Quest Started: ${quest.config.title}!}`);

        if (hasValue(quest.config.description)) {
            sayAt(player, line(80));
            sayAt(player, `{yellow.bold ${quest.config.description}}`, 80);
        }

        if (quest.config.rewards.length > 0) {
            sayAt(player);
            sayAt(player, `{yellow.bold ${center(80, 'Rewards')}}`);
            sayAt(player, `{yellow.bold ${center(80, '-------')}}`);

            for (const reward of quest.config.rewards) {
                const rwd = state.questRewardManager.get(reward.type);

                if (hasValue(rwd)) {
                    sayAt(player, `  ${rwd.display(state, quest, player, reward.config)}`);
                }
            }
        }

        sayAt(player, line(80));
    },
};

export default evt;
