import MudEvent from '../../events/mud-event';

import type {QuestProgress} from '../quest';

export interface QuestProgressPayload {
    progress: QuestProgress;
}

export class QuestProgressEvent extends MudEvent<QuestProgressPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'progress';
    public progress: QuestProgress;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default QuestProgressEvent;
