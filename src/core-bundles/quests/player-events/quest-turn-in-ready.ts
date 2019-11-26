import Player from '~/lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '~/lib/events/mud-event';
import {PlayerQuestTurnInReadyEvent, PlayerQuestTurnInReadyPayload} from '~/lib/players/player-events';
import {sayAt} from '~/lib/communication/broadcast';

export const evt: MudEventListenerFactory<PlayerQuestTurnInReadyPayload> = {
    name: PlayerQuestTurnInReadyEvent.getName(),
    listener: (): MudEventListener<PlayerQuestTurnInReadyPayload> => (player: Player, {quest}) => {
        sayAt(player, `<b><yellow>${quest.config.title} ready to turn in!</yellow></b>`);
    },
};

export default evt;
