import MudEvent from '../../events/mud-event.js';

export class PlayerSavedEvent extends MudEvent<void> {
    public NAME: string = 'saved';
}

export default PlayerSavedEvent;
