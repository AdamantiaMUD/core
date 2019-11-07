import Broadcast from '../../../lib/communication/broadcast';
import Quest from '../../../lib/quests/quest';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {QuestProgressEvent, QuestProgressPayload} from '../../../lib/quests/quest-events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<QuestProgressPayload> = {
    name: new QuestProgressEvent().getName(),
    listener: (): MudEventListener<QuestProgressPayload> => {
        return (quest: Quest, {progress}) => {
            sayAt(quest.player, `\r\n<b><yellow>${progress.display}</yellow></b>`);
        };
    },
};

export default evt;
