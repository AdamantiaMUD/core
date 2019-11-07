import {MudEvent, MudEventConstructor} from '../events/mud-event';

export const SocketCloseEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'close';
};

export const SocketDataEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'data';
};

export const SocketErrorEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public NAME: string = 'error';
};
