import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Account creation event
 */
export const createAccount: InputEventListenerDefinition = {
    event: () => (socket: TransportStream<EventEmitter>, name: string) => {
        const write = EventUtil.genWrite(socket);
        const say = EventUtil.genSay(socket);

        let newAccount = null;

        /* eslint-disable-next-line max-len */
        write(`<b>Do you want your account's username to be ${name}?</b> <cyan>[y/n]</cyan> `);

        socket.once('data', (buf: Buffer) => {
            const data = buf.toString('utf8')
                .trim()
                .toLowerCase();

            if (data === 'y' || data === 'yes') {
                say('Creating account...');

                newAccount = new Account();
                newAccount.username = name;

                socket.emit('change-password', {
                    account: newAccount,
                    nextStage: 'create-player',
                });

                return;
            }

            if (data && (data === 'n' || data === 'no')) {
                say("Let's try again!");

                socket.emit('login');

                return;
            }

            socket.emit('create-account', name);
        });
    },
};

export default createAccount;
