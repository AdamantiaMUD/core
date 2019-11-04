import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerQuestTurnInReadyEvent, PlayerQuestTurnInReadyPayload} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<PlayerQuestTurnInReadyPayload> = {
    name: PlayerQuestTurnInReadyEvent.getName(),
    listener: (): MudEventListener<PlayerQuestTurnInReadyPayload> => {
        return (player: Player, {quest}) => {
            sayAt(player, `<b><yellow>${quest.config.title} ready to turn in!</yellow></b>`);
        };
    },
};

export default evt;
