import { noop } from '../../util/functions.js';

import type StreamEventListenerFactory from '../../events/stream-event-listener-factory.js';

const mockInputEvent: StreamEventListenerFactory<unknown> = {
    name: 'mock-event',
    listener: () => noop,
};

export default mockInputEvent;
