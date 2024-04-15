import MudEvent from '../../events/mud-event.js';

export class QuestCompletedEvent extends MudEvent<void> {
    public NAME: string = 'complete';
}

export default QuestCompletedEvent;
