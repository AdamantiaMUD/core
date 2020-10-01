import MudEvent from '../../events/mud-event';

import type Quest from '../../quests/quest';

export interface PlayerQuestStartedPayload {
    quest: Quest;
}

export class PlayerQuestStartedEvent extends MudEvent<PlayerQuestStartedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'quest-start';
    public quest: Quest;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerQuestStartedEvent;
