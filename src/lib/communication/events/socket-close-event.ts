import MudEvent from '../../events/mud-event.js';

export class SocketCloseEvent extends MudEvent<void> {
    public NAME: string = 'close';
}

export default SocketCloseEvent;
