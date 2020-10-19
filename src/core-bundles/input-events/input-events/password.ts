import type {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import {ChooseCharacterEvent, InputPasswordEvent} from '../lib/events';
import {hasValue} from '../../../lib/util/functions';

import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {InputPasswordPayload} from '../lib/events';

const passwordAttempts = {};
const maxFailedAttempts = 2;

/**
 * Account password event
 */
export const evt: StreamEventListenerFactory<InputPasswordPayload> = {
    name: InputPasswordEvent.getName(),
    listener: (): StreamEventListener<InputPasswordPayload> => (
        stream: TransportStream<EventEmitter>,
        {account}: InputPasswordPayload
    ): void => {
        const write = EventUtil.genWrite(stream);

        const name = account.username;

        if (!hasValue(passwordAttempts[name])) {
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
                stream.dispatch(new ChooseCharacterEvent({account}));
            }
            else {
                write('<red>Incorrect password.</red>\r\n');
                passwordAttempts[name] += 1;

                stream.dispatch(new InputPasswordEvent({account}));
            }
        });
    },
};

export default evt;
