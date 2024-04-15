import StreamEvent from '../../../../lib/events/stream-event.js';

export class BeginLoginEvent extends StreamEvent<void> {
    public NAME: string = 'stream-login';
}

export default BeginLoginEvent;
