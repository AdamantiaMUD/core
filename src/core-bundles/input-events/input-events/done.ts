import type {EventEmitter} from 'events';

import Broadcast from '../../../lib/communication/broadcast.js';
import {PlayerLoginEvent} from '../../../lib/players/events/index.js';
import {CommandLoopEvent, LoginCompleteEvent} from '../lib/events/index.js';

import type GameStateData from '../../../lib/game-state-data.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';
import type {LoginCompletePayload} from '../lib/events/index.js';

/**
 * Login is done, allow the player to actually execute commands
 */
export const evt: StreamEventListenerFactory<LoginCompletePayload> = {
    name: LoginCompleteEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<LoginCompletePayload> => (
        stream: TransportStream<EventEmitter>,
        {player}: LoginCompletePayload
    ): void => {
        player.setMeta('lastCommandTime', Date.now());

        state.commandManager
            .get('look')!
            .execute('', player);

        Broadcast.prompt(player);

        // All done, let them play!
        player.socket!.dispatch(new CommandLoopEvent({player}));

        player.dispatch(new PlayerLoginEvent());
    },
};

export default evt;
