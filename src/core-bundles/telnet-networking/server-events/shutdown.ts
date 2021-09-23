import {GameServerShutdownEvent} from '../../../lib/game-server/events';
import {noop} from '../../../lib/util/functions';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';

export const evt: MudEventListenerDefinition<never[]> = {
    name: GameServerShutdownEvent.getName(),

    // no need to do anything special in shutdown
    listener: (): MudEventListener => noop,
};

export default evt;
