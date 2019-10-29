import {MudEvent, MudEventConstructor} from '../events/mud-event';
import {QuestRewardDefinition} from './quest-reward';
import {QuestProgress} from './quest';

export const QuestCompletedEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'complete';
};

export interface QuestProgressPayload {
    progress: QuestProgress;
}

export const QuestProgressEvent: MudEventConstructor<QuestProgressPayload> = class extends MudEvent<QuestProgressPayload> {
    public NAME: string = 'progress';
    public progress: QuestProgress;
};

export interface QuestRewardPayload {
    reward: QuestRewardDefinition;
}

export const QuestRewardEvent: MudEventConstructor<QuestRewardPayload> = class extends MudEvent<QuestRewardPayload> {
    public NAME: string = 'quest-reward';
    public reward: QuestRewardDefinition;
};

export const QuestStartedEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'start';
};

export const QuestTurnInReadyEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'turn-in-ready';
};
