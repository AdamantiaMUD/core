import MudEvent from '../../events/mud-event.js';

export class PlayerLoginEvent extends MudEvent<void> {
    public NAME: string = 'login';
}

export default PlayerLoginEvent;
