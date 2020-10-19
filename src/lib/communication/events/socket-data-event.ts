import MudEvent from '../../events/mud-event';

export class SocketDataEvent extends MudEvent<void> {
    public NAME: string = 'data';
}

export default SocketDataEvent;
