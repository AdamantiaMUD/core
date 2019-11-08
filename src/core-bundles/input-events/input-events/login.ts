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
    public NAME: string = 'stream-login';
};

export const evt: StreamEventListenerFactory<never> = {
    name: new StreamLoginEvent().getName(),
    listener: (state: GameState): StreamEventListener<never> => (stream: TransportStream<EventEmitter>) => {
        stream.write('Welcome, what is your username? ');

        stream.socket.once('data', async (buf: Buffer) => {
            const name = buf.toString().trim().toLowerCase();

            try {
                validateAccountName(state.config, name);
            }
            catch (err) {
                stream.write(`${err.message}\r\n`);

                stream.dispatch(new StreamLoginEvent());

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

                stream.dispatch(new StreamCreateAccountEvent({name}));

                return;
            }

            if (account.banned) {
                stream.write('This account has been banned.\r\n');
                stream.end();

                return;
            }

            if (account.deleted) {
                stream.write('This account has been deleted.\r\n');
                stream.end();

                return;
            }

            stream.dispatch(new StreamAccountPasswordEvent({account}));
        });
    },
};

export default evt;
