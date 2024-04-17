import MudEvent from '../../events/mud-event.js';
import type Quest from '../../quests/quest.js';

export interface PlayerQuestCompletedPayload {
    quest: Quest;
}

export class PlayerQuestCompletedEvent extends MudEvent<PlayerQuestCompletedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'quest-complete';
    public quest!: Quest;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerQuestCompletedEvent;
