import MudEvent from '../../events/mud-event';

export class QuestCompletedEvent extends MudEvent<void> {
    public NAME: string = 'complete';
}

export default QuestCompletedEvent;
