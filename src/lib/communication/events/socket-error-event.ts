import MudEvent from '../../events/mud-event';

export class SocketErrorEvent extends MudEvent<void> {
    public NAME: string = 'error';
}

export default SocketErrorEvent;
