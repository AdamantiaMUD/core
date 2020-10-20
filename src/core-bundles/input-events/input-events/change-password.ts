import type {EventEmitter} from 'events';

import {ChangePasswordEvent, ConfirmPasswordEvent} from '../lib/events';
import {hasValue} from '../../../lib/util/functions';

import type GameStateData from '../../../lib/game-state-data';
import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';
import type {ChangePasswordPayload} from '../lib/events';

/**
 * Change password event
 */
export const evt: StreamEventListenerFactory<ChangePasswordPayload> = {
    name: ChangePasswordEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<ChangePasswordPayload> => (
        stream: TransportStream<EventEmitter>,
        args: ChangePasswordPayload
    ): void => {
        const {account} = args;

        stream.write('Your password must be at least 8 characters.');
        stream.write('{cyan Enter your account password:} ');

        stream.command('toggleEcho');

        stream.socket.once('data', (buf: Buffer) => {
            stream.command('toggleEcho');

            stream.write('');

            const pass = buf.toString().trim();

            if (!hasValue(pass) || pass.length === 0) {
                stream.write('You must use a password.');

                stream.dispatch(new ChangePasswordEvent(args));

                return;
            }

            if (pass.length < 8) {
                stream.write('Your password is not long enough.');

                stream.dispatch(new ChangePasswordEvent(args));

                return;
            }

            // setPassword handles hashing
            account.setPassword(pass);
            state.accountManager.setAccount(account.username, account);
            account.save();

            stream.dispatch(new ConfirmPasswordEvent(args));
        });
    },
};

export default evt;
