import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamConfirmPasswordEvent} from './confirm-password';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamChangePasswordPayload {
    account: Account;
    NextEvent: StreamEventConstructor<{account: Account}>;
}

export const StreamChangePasswordEvent: StreamEventConstructor<StreamChangePasswordPayload> = class extends StreamEvent<StreamChangePasswordPayload> {
    public NAME: string = 'stream-change-password';
    public account: Account;
    public NextEvent: StreamEventConstructor<{account: Account}>;
};

/**
 * Change password event
 */
export const evt: StreamEventListenerFactory<StreamChangePasswordPayload> = {
    name: StreamChangePasswordEvent.getName(),
    listener: (state: GameState): StreamEventListener<StreamChangePasswordPayload> => (
        stream: TransportStream<EventEmitter>,
        args: StreamChangePasswordPayload
    ) => {
        const say = EventUtil.genSay(stream);
        const write = EventUtil.genWrite(stream);

        const {account} = args;

        say('Your password must be at least 8 characters.');
        write('<cyan>Enter your account password:</cyan> ');

        stream.command('toggleEcho');

        stream.socket.once('data', (buf: Buffer) => {
            stream.command('toggleEcho');

            say('');

            const pass = buf.toString().trim();

            if (!pass) {
                say('You must use a password.');

                stream.dispatch(new StreamChangePasswordEvent(args));

                return;
            }

            if (pass.length < 8) {
                say('Your password is not long enough.');

                stream.dispatch(new StreamChangePasswordEvent(args));

                return;
            }

            // setPassword handles hashing
            account.setPassword(pass);
            state.accountManager.setAccount(account.username, account);
            account.save();

            stream.dispatch(new StreamConfirmPasswordEvent(args));
        });
    },
};

export default evt;
