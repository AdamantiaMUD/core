import MudEvent from '../../events/mud-event';

export class PlayerSavedEvent extends MudEvent<void> {
    public NAME: string = 'saved';
}

export default PlayerSavedEvent;
