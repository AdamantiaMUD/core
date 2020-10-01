import MudEvent from '../../events/mud-event';

import type {QuestRewardDefinition} from '../quest-reward';

export interface QuestRewardPayload {
    reward: QuestRewardDefinition;
}

export class QuestRewardEvent extends MudEvent<QuestRewardPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'quest-reward';
    public reward: QuestRewardDefinition;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
};

export default QuestRewardEvent;
