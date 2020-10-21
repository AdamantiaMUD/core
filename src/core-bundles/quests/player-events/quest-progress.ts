import {QuestProgressEvent} from '../../../lib/quests/events';
import {sayAt} from '../../../lib/communication/broadcast';

import type Quest from '../../../lib/quests/quest';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type {QuestProgressPayload} from '../../../lib/quests/events';

export const evt: MudEventListenerDefinition<[Quest, QuestProgressPayload]> = {
    name: QuestProgressEvent.getName(),
    listener: (): MudEventListener<[Quest, QuestProgressPayload]> => (
        quest: Quest,
        {progress}: QuestProgressPayload
    ): void => {
        sayAt(quest.player, `{yellow.bold ${progress.display}}`);
    },
};

export default evt;
