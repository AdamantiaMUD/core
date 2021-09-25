import MudEvent from '../../events/mud-event';

export class QuestTurnInReadyEvent extends MudEvent<void> {
    public NAME: string = 'turn-in-ready';
}

export default QuestTurnInReadyEvent;
