import MudEvent from '../../events/mud-event';

import type Quest from '../../quests/quest';
import type QuestProgress from '../../quests/quest-progress';

export interface PlayerQuestProgressPayload {
    progress: QuestProgress;
    quest: Quest;
}

export class PlayerQuestProgressEvent extends MudEvent<PlayerQuestProgressPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'quest-progress';
    public progress: QuestProgress;
    public quest: Quest;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerQuestProgressEvent;
