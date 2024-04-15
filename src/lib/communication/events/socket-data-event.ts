import MudEvent from '../../events/mud-event.js';

export class SocketDataEvent extends MudEvent<void> {
    public NAME: string = 'data';
}

export default SocketDataEvent;
