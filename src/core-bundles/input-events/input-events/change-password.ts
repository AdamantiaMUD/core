import type {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
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

            if (!hasValue(pass) || pass.length === 0) {
                say('You must use a password.');

                stream.dispatch(new ChangePasswordEvent(args));

                return;
            }

            if (pass.length < 8) {
                say('Your password is not long enough.');

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
