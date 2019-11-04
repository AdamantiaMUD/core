import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {validateCharacterName} from '../../../lib/util/player';

/**
 * Player creation event
 */
export const evt: MudEventListenerFactory<> = {
export const createCharacter: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>, account: Account) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

        write('<b>What would you like to name your character?</b> ');

        socket.once('data', (buf: Buffer) => {
            say('');

            const name = buf.toString().trim();

            try {
                validateCharacterName(state.config, name);
            }
            catch (err) {
                say(err.message);

                socket.emit('create-character', account);

                return;
            }

            const exists = state.playerManager.exists(name.toLowerCase());

            if (exists) {
                say('That name is already taken.');

                socket.emit('create-character', account);

                return;
            }

            socket.emit('character-name-check', {account, name});
        });
    },
};

export default createCharacter;
