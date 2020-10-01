import MudEvent from '../../events/mud-event';

export class QuestStartedEvent extends MudEvent<void> {
    public NAME: string = 'start';
}

export default QuestStartedEvent;
