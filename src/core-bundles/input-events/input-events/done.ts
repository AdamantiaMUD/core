import type {EventEmitter} from 'events';

import Broadcast from '../../../lib/communication/broadcast';
import {PlayerLoginEvent} from '../../../lib/players/events';
import {CommandLoopEvent, LoginCompleteEvent} from '../lib/events';

import type GameStateData from '../../../lib/game-state-data';
import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {LoginCompletePayload} from '../lib/events';

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
            .execute(null, player);

        Broadcast.prompt(player);

        // All done, let them play!
        player.socket!.dispatch(new CommandLoopEvent({player}));

        player.dispatch(new PlayerLoginEvent());
    },
};

export default evt;
