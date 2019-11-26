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
    name: StreamAccountPasswordEvent.getName(),
    listener: (): StreamEventListener<StreamAccountPasswordPayload> => (stream: TransportStream<EventEmitter>, {account}) => {
        const write = EventUtil.genWrite(stream);

        const name = account.username;

        if (!passwordAttempts[name]) {
            passwordAttempts[name] = 0;
        }

        // Boot and log any failed password attempts
        if (passwordAttempts[name] > maxFailedAttempts) {
            write('Password attempts exceeded.\r\n');
            passwordAttempts[name] = 0;
            stream.end();

            return;
        }

        write('Enter your password: ');
        stream.command('toggleEcho');

        stream.socket.once('data', (buf: Buffer) => {
            stream.command('toggleEcho');

            const pass = buf.toString().trim();

            if (account.checkPassword(pass)) {
                stream.dispatch(new StreamChooseCharacterEvent({account}));
            }
            else {
                write('<red>Incorrect password.</red>\r\n');
                passwordAttempts[name] += 1;

                stream.dispatch(new StreamAccountPasswordEvent({account}));
            }
        });
    },
};

export default evt;
