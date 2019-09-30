import {EventEmitter} from 'events';

import Account from '../../../lib/players/account';
import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * Change password event
 */
export const changePassword: InputEventListenerDefinition = {
    event: (state: GameState) => (
        socket: TransportStream<EventEmitter>,
        args: {account: Account; nextStage: string}
    ) => {
        const say = EventUtil.genSay(socket);
        const write = EventUtil.genWrite(socket);

        say('Your password must be at least 8 characters.');
        write('<cyan>Enter your account password:</cyan> ');

        socket.command('toggleEcho');

        socket.once('data', (buf: Buffer) => {
            socket.command('toggleEcho');

            say('');

            const pass = buf.toString().trim();

            if (!pass) {
                say('You must use a password.');

                socket.emit('change-password', args);

                return;
            }

            if (pass.length < 8) {
                say('Your password is not long enough.');

                socket.emit('change-password', args);

                return;
            }

            // setPassword handles hashing
            args.account.setPassword(pass);
            state.accountManager.addAccount(args.account);
            args.account.save();

            socket.emit('confirm-password', args);
        });
    },
};

export default changePassword;
