import EventEmitter from 'events';

import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import TransportStream from '../../../lib/communication/transport-stream';
import {PlayerLoginEvent} from '../../../lib/players/player-events';
import {StreamCommandsEvent} from './commands';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamDonePayload {
    player: Player;
}

export const StreamDoneEvent: StreamEventConstructor<StreamDonePayload> = class extends StreamEvent<StreamDonePayload> {
    public NAME: string = 'done';
    public player: Player;
};

/**
 * Login is done, allow the player to actually execute commands
 */
export const evt: StreamEventListenerFactory<StreamDonePayload> = {
    name: new StreamDoneEvent().getName(),
    listener: (state: GameState): StreamEventListener<StreamDonePayload> => (stream: TransportStream<EventEmitter>, {player}) => {
        player.setMeta('lastCommandTime', Date.now());

        state.commandManager
            .get('look')
            .execute(null, player);

        Broadcast.prompt(player);

        // All done, let them play!
        player.socket.dispatch(new StreamCommandsEvent({player}));

        player.dispatch(new PlayerLoginEvent());
    },
};

export default evt;
