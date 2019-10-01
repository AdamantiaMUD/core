import {EventEmitter} from 'events';

import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Login is done, allow the player to actually execute commands
 */
export const loginDone: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>, player: Player) => {
        player.setMeta('lastCommandTime', Date.now());

        state.commandManager
            .get('look')
            .execute(null, player);

        Broadcast.prompt(player);

        // All done, let them play!
        player.socket.emit('commands', player);

        player.emit('login');
    },
};

export default loginDone;
