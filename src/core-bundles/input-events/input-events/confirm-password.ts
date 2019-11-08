import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamChangePasswordEvent} from './change-password';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamConfirmPasswordPayload {
    account: Account;
    NextEvent: StreamEventConstructor<{account: Account}>;
}

export const StreamConfirmPasswordEvent: StreamEventConstructor<StreamConfirmPasswordPayload> = class extends StreamEvent<StreamConfirmPasswordPayload> {
    public NAME: string = 'stream-confirm-password';
    public account: Account;
    public NextEvent: StreamEventConstructor<{account: Account}>;
};

/**
 * Account password confirmation station
 */
export const evt: StreamEventListenerFactory<StreamConfirmPasswordPayload> = {
    name: new StreamConfirmPasswordEvent().getName(),
    listener: (): StreamEventListener<StreamConfirmPasswordPayload> => (
        stream: TransportStream<EventEmitter>,
        args: StreamConfirmPasswordPayload
    ) => {
        const write = EventUtil.genWrite(stream);
        const say = EventUtil.genSay(stream);

        write('<cyan>Confirm your password:</cyan> ');

        stream.command('toggleEcho');

        stream.socket.once('data', pass => {
            stream.command('toggleEcho');

            if (!args.account.checkPassword(pass.toString().trim())) {
                say('<red>Passwords do not match.</red>');

                stream.dispatch(new StreamChangePasswordEvent(args));

                return;
            }

            // echo was disabled, the user's Enter didn't make a newline
            say('');

            const {NextEvent} = args;

            stream.dispatch(new NextEvent({account: args.account}));
        });
    },
};

export default evt;
