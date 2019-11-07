import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerQuestStartedEvent, PlayerQuestStartedPayload} from '../../../lib/players/player-events';

const {center, line, sayAt} = Broadcast;

export const evt: MudEventListenerFactory<PlayerQuestStartedPayload> = {
    name: new PlayerQuestStartedEvent().getName(),
    listener: (state: GameState): MudEventListener<PlayerQuestStartedPayload> => {
        return (player: Player, {quest}) => {
            sayAt(player, `\r\n<b><yellow>Quest Started: ${quest.config.title}!</yellow></b>`);

            if (quest.config.description) {
                sayAt(player, line(80));
                sayAt(player, `<b><yellow>${quest.config.description}</yellow></b>`, 80);
            }

            if (quest.config.rewards.length) {
                sayAt(player);
                sayAt(player, `<b><yellow>${center(80, 'Rewards')}</yellow></b>`);
                sayAt(player, `<b><yellow>${center(80, '-------')}</yellow></b>`);

                for (const reward of quest.config.rewards) {
                    const rwd = state.questRewardManager.get(reward.type);

                    sayAt(player, `  ${rwd.display(state, quest, reward.config, player)}`);
                }
            }

            sayAt(player, line(80));
        };
    },
};

export default evt;
