import MudEvent from '../../events/mud-event.js';

export class SocketErrorEvent extends MudEvent<void> {
    public NAME: string = 'error';
}

export default SocketErrorEvent;
