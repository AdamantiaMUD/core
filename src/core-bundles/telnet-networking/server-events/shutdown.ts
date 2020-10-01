import {GameServerShutdownEvent} from '~/lib/game-server-events';
import {MudEventListener, MudEventListenerFactory} from '~/lib/events/mud-event';

export const evt: MudEventListenerFactory<void> = {
    name: GameServerShutdownEvent.getName(),
    listener: (): MudEventListener<void> => () => {
        // no need to do anything special in shutdown
    },
};

export default evt;
