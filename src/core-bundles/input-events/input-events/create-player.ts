import {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';
import {validateAccountName} from '../../../lib/util/player';

/**
 * Player creation event
 */
export const createPlayer: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>, account: Account) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

        write('<b>What would you like to name your character?</b> ');

        socket.once('data', (buf: Buffer) => {
            say('');

            let name = buf.toString().trim();

            try {
                validateAccountName(state.config, name);
            }
            catch (err) {
                say(err.message);

                socket.emit('create-player', account);

                return;
            }

            name = name[0].toUpperCase() + name.slice(1);

            const exists = state.playerManager.exists(name);

            if (exists) {
                say('That name is already taken.');

                socket.emit('create-player', account);

                return;
            }

            socket.emit('player-name-check', {account, name});
        });
    },
};

export default createPlayer;
