import type { EventEmitter } from 'events';

import type TransportStream from '../../../lib/communication/transport-stream.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import { hasValue } from '../../../lib/util/functions.js';
import {
    type InputPasswordPayload,
    ChooseCharacterEvent,
    InputPasswordEvent,
} from '../lib/events/index.js';

const passwordAttempts: Record<string, number> = {};
const maxFailedAttempts = 2;

/**
 * Account password event
 */
export const evt: StreamEventListenerFactory<InputPasswordPayload> = {
    name: InputPasswordEvent.getName(),
    listener:
        (): StreamEventListener<InputPasswordPayload> =>
        (
            stream: TransportStream<EventEmitter>,
            { account }: InputPasswordPayload
        ): void => {
            const name = account.username;

            if (!hasValue(passwordAttempts[name])) {
                passwordAttempts[name] = 0;
            }

            // Boot and log any failed password attempts
            if (passwordAttempts[name] > maxFailedAttempts) {
                stream.write('Password attempts exceeded.');
                passwordAttempts[name] = 0;
                stream.end();

                return;
            }

            stream.write('Enter your password: ');
            stream.command('toggleEcho');

            stream.socket.once('data', (buf: Buffer) => {
                stream.command('toggleEcho');

                const pass = buf.toString().trim();

                if (account.checkPassword(pass)) {
                    stream.dispatch(new ChooseCharacterEvent({ account }));
                } else {
                    stream.write('{red Incorrect password.}');
                    passwordAttempts[name] += 1;

                    stream.dispatch(new InputPasswordEvent({ account }));
                }
            });
        },
};

export default evt;
