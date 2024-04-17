import { sayAt } from '../../../lib/communication/broadcast.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import {
    type QuestProgressPayload,
    QuestProgressEvent,
} from '../../../lib/quests/events/index.js';
import type Quest from '../../../lib/quests/quest.js';

export const evt: MudEventListenerDefinition<[Quest, QuestProgressPayload]> = {
    name: QuestProgressEvent.getName(),
    listener:
        (): MudEventListener<[Quest, QuestProgressPayload]> =>
        (quest: Quest, { progress }: QuestProgressPayload): void => {
            sayAt(quest.player, `{yellow.bold ${progress.display}}`);
        },
};

export default evt;
