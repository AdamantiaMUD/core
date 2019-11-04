import {GameServerShutdownEvent} from '../../../lib/game-server-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

export const evt: MudEventListenerFactory<never> = {
    name: GameServerShutdownEvent.getName(),
    listener: (): MudEventListener<never> => () => {
        // no need to do anything special in shutdown
    },
};

export default evt;
