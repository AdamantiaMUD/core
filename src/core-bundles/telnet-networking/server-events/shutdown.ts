import { GameServerShutdownEvent } from '../../../lib/game-server/events/index.js';
import { noop } from '../../../lib/util/functions.js';

import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';

export const evt: MudEventListenerDefinition<never[]> = {
    name: GameServerShutdownEvent.getName(),

    // no need to do anything special in shutdown
    listener: (): MudEventListener => noop,
};

export default evt;
