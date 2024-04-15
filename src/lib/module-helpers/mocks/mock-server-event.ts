import {noop} from '../../util/functions.js';

import type MudEventListenerDefinition from '../../events/mud-event-listener-definition.js';

const mockServerEvent: MudEventListenerDefinition<unknown[]> = {
    name: 'mock server event',
    listener: () => noop,
};

export default mockServerEvent;
