import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamChooseCharacterEvent} from './choose-character';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

const passwordAttempts = {};
const maxFailedAttempts = 2;

export interface StreamAccountPasswordPayload {
    account: Account;
}

export const StreamAccountPasswordEvent: StreamEventConstructor<StreamAccountPasswordPayload> = class extends StreamEvent<StreamAccountPasswordPayload> {
    public NAME: string = 'stream-account-password';
    public account: Account;
};

/**
 * Account password event
 */
export const evt: StreamEventListenerFactory<StreamAccountPasswordPayload> = {
    name: new StreamAccountPasswordEvent().getName(),
    listener: (): StreamEventListener<StreamAccountPasswordPayload> => (socket: TransportStream<EventEmitter>, {account}) => {
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
                socket.dispatch(new StreamChooseCharacterEvent({account}));
            }
            else {
                write('<red>Incorrect password.</red>\r\n');
                passwordAttempts[name] += 1;

                socket.dispatch(new StreamAccountPasswordEvent({account}));
            }
        });
    },
};

export default evt;
