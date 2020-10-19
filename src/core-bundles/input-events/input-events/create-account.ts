import type {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import {
    BeginLoginEvent,
    ChangePasswordEvent,
    CreateAccountEvent,
    CreateCharacterEvent,
} from '../lib/events';
import {hasValue} from '../../../lib/util/functions';

import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {CreateAccountPayload} from '../lib/events';

/**
 * Account creation event
 */
export const evt: StreamEventListenerFactory<CreateAccountPayload> = {
    name: CreateAccountEvent.getName(),
    listener: (): StreamEventListener<CreateAccountPayload> => (
        stream: TransportStream<EventEmitter>,
        {name}: CreateAccountPayload
    ): void => {
        const write = EventUtil.genWrite(stream);
        const say = EventUtil.genSay(stream);

        let newAccount: Account | null = null;

        write(`<b>Do you want your account's username to be ${name}?</b> <cyan>[y/n]</cyan> `);

        stream.socket.once('data', (buf: Buffer) => {
            const data = buf.toString('utf8')
                .trim()
                .toLowerCase();

            if (data === 'y' || data === 'yes') {
                say('Creating account...');

                newAccount = new Account();
                newAccount.username = name;

                stream.dispatch(new ChangePasswordEvent({
                    account: newAccount,
                    nextEvent: new CreateCharacterEvent({account: newAccount}),
                }));

                return;
            }

            if (hasValue(data) && (data === 'n' || data === 'no')) {
                say("Let's try again!");

                stream.dispatch(new BeginLoginEvent());

                return;
            }

            stream.dispatch(new CreateAccountEvent({name}));
        });
    },
};

export default evt;
