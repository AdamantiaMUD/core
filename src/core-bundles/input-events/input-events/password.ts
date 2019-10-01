import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

const passwordAttempts = {};
const maxFailedAttempts = 2;

/**
 * Account password event
 */
export const password: InputEventListenerDefinition = {
    event: () => (socket: TransportStream<EventEmitter>, account: Account) => {
        const write = EventUtil.genWrite(socket);

        const name = account.username;

        if (!passwordAttempts[name]) {
            passwordAttempts[name] = 0;
        }

        // Boot and log any failed password attempts
        if (passwordAttempts[name] > maxFailedAttempts) {
            write('Password attempts exceeded.\r\n');
            passwordAttempts[name] = 0;
            socket.end();

            return;
        }

        write('Enter your password: ');
        socket.command('toggleEcho');

        socket.once('data', (buf: Buffer) => {
            socket.command('toggleEcho');

            const pass = buf.toString().trim();

            if (account.checkPassword(pass)) {
                socket.emit('choose-character', account);
            }
            else {
                write('<red>Incorrect password.</red>\r\n');
                passwordAttempts[name] += 1;

                socket.emit('password', account);
            }
        });
    },
};

export default password;
