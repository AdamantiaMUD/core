import type {EventEmitter} from 'events';

import Account from '../../../lib/players/account.js';
import {
    BeginLoginEvent,
    ChangePasswordEvent,
    CreateAccountEvent,
    CreateCharacterEvent,
} from '../lib/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';

import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';
import type {CreateAccountPayload} from '../lib/events/index.js';

/**
 * Account creation event
 */
export const evt: StreamEventListenerFactory<CreateAccountPayload> = {
    name: CreateAccountEvent.getName(),
    listener: (): StreamEventListener<CreateAccountPayload> => (
        stream: TransportStream<EventEmitter>,
        {name}: CreateAccountPayload
    ): void => {
        let newAccount: Account | null = null;

        stream.write(`{bold Do you want your account's username to be {yellow ${name}}?} {cyan [y/n]} `);

        stream.socket.once('data', (buf: Buffer) => {
            const data = buf.toString('utf8')
                .trim()
                .toLowerCase();

            if (data === 'y' || data === 'yes') {
                stream.write('Creating account...');

                newAccount = new Account();
                newAccount.username = name;

                stream.dispatch(new ChangePasswordEvent({
                    account: newAccount,
                    nextEvent: new CreateCharacterEvent({account: newAccount}),
                }));

                return;
            }

            if (hasValue(data) && (data === 'n' || data === 'no')) {
                stream.write("Let's try again!");

                stream.dispatch(new BeginLoginEvent());

                return;
            }

            stream.dispatch(new CreateAccountEvent({name}));
        });
    },
};

export default evt;
