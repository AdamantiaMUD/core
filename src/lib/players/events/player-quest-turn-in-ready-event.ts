import MudEvent from '../../events/mud-event.js';
import type Quest from '../../quests/quest.js';

export interface PlayerQuestTurnInReadyPayload {
    quest: Quest;
}

export class PlayerQuestTurnInReadyEvent extends MudEvent<PlayerQuestTurnInReadyPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'quest-turn-in-ready';
    public quest!: Quest;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerQuestTurnInReadyEvent;
