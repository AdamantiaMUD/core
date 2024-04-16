import { noop } from '../../util/functions.js';

import type MudEventListenerDefinition from '../../events/mud-event-listener-definition.js';

const mockPlayerEvent: MudEventListenerDefinition<unknown[]> = {
    name: 'mock player event',
    listener: () => noop,
};

export default mockPlayerEvent;
