import Player from '~/lib/players/player';
import {MudEventListener, MudEventListenerDefinition} from '~/lib/events/mud-event';
import {PlayerQuestCompletedEvent, PlayerQuestCompletedPayload} from '~/lib/players/player-events';
import {line, sayAt} from '~/lib/communication/broadcast';

export const evt: MudEventListenerDefinition<PlayerQuestCompletedPayload> = {
    name: PlayerQuestCompletedEvent.getName(),
    listener: (): MudEventListener<PlayerQuestCompletedPayload> => (player: Player, {quest}) => {
        sayAt(player, `<b><yellow>Quest Complete: ${quest.config.title}!</yellow></b>`);

        if (quest.config.completionMessage) {
            sayAt(player, line(80));
            sayAt(player, quest.config.completionMessage);
        }
    },
};

export default evt;
