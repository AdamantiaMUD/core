import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import { GameServerShutdownEvent } from '../../../lib/game-server/events/index.js';

export const evt: MudEventListenerDefinition<never[]> = {
    name: GameServerShutdownEvent.getName(),
    listener: (): MudEventListener => (): void => {
        // no need to do anything special in shutdown
    },
};

export default evt;
