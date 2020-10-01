import MudEvent from '../events/mud-event';

export class SocketCloseEvent extends MudEvent<{}> {
    public NAME: string = 'close';
};

export class SocketDataEvent extends MudEvent<{}> {
    public NAME: string = 'data';
};

export class SocketErrorEvent extends MudEvent<{}> {
    public NAME: string = 'error';
};
