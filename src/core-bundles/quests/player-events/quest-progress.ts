import Quest from '~/lib/quests/quest';
import {MudEventListener, MudEventListenerFactory} from '~/lib/events/mud-event';
import {QuestProgressEvent, QuestProgressPayload} from '~/lib/quests/quest-events';
import {sayAt} from '~/lib/communication/broadcast';

export const evt: MudEventListenerFactory<QuestProgressPayload> = {
    name: QuestProgressEvent.getName(),
    listener: (): MudEventListener<QuestProgressPayload> => (quest: Quest, {progress}) => {
        sayAt(quest.player, `\r\n<b><yellow>${progress.display}</yellow></b>`);
    },
};

export default evt;
