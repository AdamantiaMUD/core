import StreamEvent from '../../../../lib/events/stream-event';

export class IntroEvent extends StreamEvent<void> {
    public NAME: string = 'stream-intro';
}

export default IntroEvent;
