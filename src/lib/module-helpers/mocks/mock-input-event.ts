import type StreamEventListenerFactory from '../../events/stream-event-listener-factory.js';
import { noop } from '../../util/functions.js';

const mockInputEvent: StreamEventListenerFactory<unknown> = {
    name: 'mock-event',
    listener: () => noop,
};

export default mockInputEvent;
