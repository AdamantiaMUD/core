import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamChangePasswordEvent} from './change-password';
import {StreamCreateCharacterEvent} from './create-character';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {StreamLoginEvent} from './login';

export interface StreamCreateAccountPayload {
    name: string;
}

export const StreamCreateAccountEvent: StreamEventConstructor<StreamCreateAccountPayload> = class extends StreamEvent<StreamCreateAccountPayload> {
    public static NAME: string = 'stream-create-account';
    public name: string;
};

/**
 * Account creation event
 */
export const evt: StreamEventListenerFactory<StreamCreateAccountPayload> = {
    name: StreamCreateAccountEvent.getName(),
    listener: (): StreamEventListener<StreamCreateAccountPayload> => (socket: TransportStream<EventEmitter>, {name}) => {
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

                socket.dispatch(new StreamChangePasswordEvent({
                    account: newAccount,
                    NextEvent: StreamCreateCharacterEvent,
                }));

                return;
            }

            if (data && (data === 'n' || data === 'no')) {
                say("Let's try again!");

                socket.dispatch(new StreamLoginEvent());

                return;
            }

            socket.dispatch(new StreamCreateAccountEvent({name}));
        });
    },
};

export default createAccount;
