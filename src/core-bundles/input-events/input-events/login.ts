import type { EventEmitter } from 'events';

import Logger from '../../../lib/common/logger.js';
import {
    BeginLoginEvent,
    CreateAccountEvent,
    InputPasswordEvent,
} from '../lib/events/index.js';
import { cast, hasValue } from '../../../lib/util/functions.js';
import { validateAccountName } from '../../../lib/util/player.js';

import type Account from '../../../lib/players/account.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type TransportStream from '../../../lib/communication/transport-stream.js';

export const evt: StreamEventListenerFactory<void> = {
    name: BeginLoginEvent.getName(),
    listener:
        (state: GameStateData): StreamEventListener<void> =>
        (stream: TransportStream<EventEmitter>): void => {
            stream.write('Welcome, what is your username? ');

            stream.socket.once('data', (buf: Buffer) => {
                const runner = async (): Promise<void> => {
                    const name = buf.toString().trim().toLowerCase();

                    try {
                        validateAccountName(state.config, name);
                    } catch (err: unknown) {
                        stream.write(cast<Error>(err).message);

                        stream.dispatch(new BeginLoginEvent());

                        return;
                    }

                    let account: Account | null = null;

                    try {
                        account = await state.accountManager.loadAccount(name);
                    } catch (err: unknown) {
                        Logger.error(cast<Error>(err).message);

                        stream.dispatch(new CreateAccountEvent({ name }));

                        return;
                    }

                    if (!hasValue(account)) {
                        Logger.error(`No account found as ${name}.`);

                        stream.dispatch(new CreateAccountEvent({ name }));

                        return;
                    }

                    if (account.isBanned) {
                        stream.write('This account has been banned.');
                        stream.end();

                        return;
                    }

                    if (account.isDeleted) {
                        stream.write('This account has been deleted.');
                        stream.end();

                        return;
                    }

                    stream.dispatch(new InputPasswordEvent({ account }));
                };

                /* eslint-disable @typescript-eslint/no-floating-promises */
                // noinspection JSIgnoredPromiseFromCall
                runner();
                /* eslint-enable @typescript-eslint/no-floating-promises */
            });
        },
};

export default evt;
