import { center, line, sayAt } from '../../../lib/communication/broadcast.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import {
    type PlayerQuestStartedPayload,
    PlayerQuestStartedEvent,
} from '../../../lib/players/events/index.js';
import type Player from '../../../lib/players/player.js';
import { hasValue } from '../../../lib/util/functions.js';

export const evt: PlayerEventListenerDefinition<PlayerQuestStartedPayload> = {
    name: PlayerQuestStartedEvent.getName(),
    listener:
        (
            state: GameStateData
        ): PlayerEventListener<PlayerQuestStartedPayload> =>
        (player: Player, { quest }: PlayerQuestStartedPayload): void => {
            sayAt(
                player,
                `{yellow.bold Quest Started: ${quest.config.title}!}`
            );

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
                        sayAt(
                            player,
                            `  ${rwd.display(state, quest, player, reward.config)}`
                        );
                    }
                }
            }

            sayAt(player, line(80));
        },
};

export default evt;
