import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';

export interface StreamChangePasswordPayload {
    account: Account;
    nextStage: string;
}

export const StreamChangePasswordEvent: StreamEventConstructor<StreamChangePasswordPayload> = class extends StreamEvent<StreamChangePasswordPayload> {
    public static NAME: string = 'stream-change-password';
    public account: Account;
    public nextStage: string;
};

/**
 * Change password event
 */
export const evt: StreamEventListenerFactory<StreamChangePasswordPayload> = {
    name: StreamChangePasswordEvent.getName(),
    listener: (state: GameState): StreamEventListener<StreamChangePasswordPayload> => (
        socket: TransportStream<EventEmitter>,
        args: StreamChangePasswordPayload
    ) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

        const {account} = args;

        say('Your password must be at least 8 characters.');
        write('<cyan>Enter your account password:</cyan> ');

        socket.command('toggleEcho');

        socket.once('data', (buf: Buffer) => {
            socket.command('toggleEcho');

            say('');

            const pass = buf.toString().trim();

            if (!pass) {
                say('You must use a password.');

                socket.dispatch(new StreamChangePasswordEvent(args));

                return;
            }

            if (pass.length < 8) {
                say('Your password is not long enough.');

                socket.dispatch(new StreamChangePasswordEvent(args));

                return;
            }

            // setPassword handles hashing
            account.setPassword(pass);
            state.accountManager.setAccount(account.username, account);
            account.save();

            socket.dispatch(new StreamConfirmPasswordEvent(args));
        });
    },
};

export default changePassword;
