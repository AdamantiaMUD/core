import EventEmitter from 'events';

import Account from '../../../lib/players/account';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import TransportStream from '../../../lib/communication/transport-stream';
import {StreamAccountPasswordEvent} from './password';
import {StreamCreateAccountEvent} from './create-account';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {validateAccountName} from '../../../lib/util/player';

export const StreamLoginEvent: StreamEventConstructor<never> = class extends StreamEvent<never> {
    public static NAME: string = 'stream-login';
};

export const evt: StreamEventListenerFactory<never> = {
    name: StreamLoginEvent.getName(),
    listener: (state: GameState): StreamEventListener<never> => (socket: TransportStream<EventEmitter>) => {
        socket.write('Welcome, what is your username? ');

        socket.once('data', async (buf: Buffer) => {
            const name = buf.toString().trim().toLowerCase();

            try {
                validateAccountName(state.config, name);
            }
            catch (err) {
                socket.write(`${err.message}\r\n`);

                socket.dispatch(new StreamLoginEvent());

                return;
            }

            let account: Account = null;

            try {
                account = await state.accountManager.loadAccount(name);
            }
            catch (e) {
                Logger.error(e.message);
            }

            if (!account) {
                Logger.error(`No account found as ${name}.`);

                socket.dispatch(new StreamCreateAccountEvent({name}));

                return;
            }

            if (account.banned) {
                socket.write('This account has been banned.\r\n');
                socket.end();

                return;
            }

            if (account.deleted) {
                socket.write('This account has been deleted.\r\n');
                socket.end();

                return;
            }

            socket.dispatch(new StreamAccountPasswordEvent({account}));
        });
    },
};

export default login;
