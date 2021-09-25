import {noop} from '../../util/functions';

import type StreamEventListenerFactory from '../../events/stream-event-listener-factory';

const mockInputEvent: StreamEventListenerFactory<unknown> = {
    name: 'mock-event',
    listener: () => noop,
};

export default mockInputEvent;
