import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerQuestCompletedEvent, PlayerQuestCompletedPayload} from '../../../lib/players/player-events';

const {line, sayAt} = Broadcast;

export const evt: MudEventListenerFactory<PlayerQuestCompletedPayload> = {
    name: PlayerQuestCompletedEvent.getName(),
    listener: (): MudEventListener<PlayerQuestCompletedPayload> => {
        return (player: Player, {quest}) => {
            sayAt(player, `<b><yellow>Quest Complete: ${quest.config.title}!</yellow></b>`);

            if (quest.config.completionMessage) {
                sayAt(player, line(80));
                sayAt(player, quest.config.completionMessage);
            }
        };
    },
};

export default evt;
