import {noop} from '../../util/functions';

import type MudEventListenerDefinition from '../../events/mud-event-listener-definition';

const mockPlayerEvent: MudEventListenerDefinition<unknown[]> = {
    name: 'mock player event',
    listener: () => noop,
};

export default mockPlayerEvent;
