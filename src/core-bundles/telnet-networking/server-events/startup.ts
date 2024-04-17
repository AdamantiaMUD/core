import Logger from '../../../lib/common/logger.js';
import type AdamantiaSocket from '../../../lib/communication/adamantia-socket.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type { StatefulListenerFactory } from '../../../lib/events/mud-event-listener-factory.js';
import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import {
    type GameServerStartupPayload,
    GameServerStartupEvent,
} from '../../../lib/game-server/events/index.js';
import type GameState from '../../../lib/game-state.js';
import { IntroEvent } from '../../input-events/lib/events/index.js';
import Options from '../lib/options.js';
import Sequences from '../lib/sequences.js';
import TelnetServer from '../lib/server.js';
import TelnetSocket from '../lib/telnet-socket.js';
import TelnetStream from '../lib/telnet-stream.js';

const DEFAULT_TELNET_PORT = 4000;

export const evt: MudEventListenerDefinition<[GameServerStartupPayload]> = {
    name: GameServerStartupEvent.getName(),
    listener: ((
            state: GameState
        ): MudEventListener<[GameServerStartupPayload]> =>
        (): void => {
            const port = state.config.get('port.telnet', DEFAULT_TELNET_PORT);

            /**
             * Effectively the 'main' game loop but not really because it's a REPL
             */
            const server = new TelnetServer((rawSocket: AdamantiaSocket) => {
                const telnetSocket = new TelnetSocket();

                telnetSocket.attach(rawSocket);
                telnetSocket.telnetCommand(Sequences.WILL, Options.OPT_EOR);

                const stream = new TelnetStream();

                stream.attach(telnetSocket);

                stream.socket.on('interrupt', () => {
                    stream.write('\n*interrupt*\n');
                });

                stream.socket.on('error', (err: unknown) => {
                    Logger.error(String(err));
                });

                // Register all of the input events (login, etc.)
                state.attachServerStream(stream);

                stream.write('Connecting...');

                Logger.info('User connected...');

                stream.dispatch(new IntroEvent());
            }).netServer;

            // Start the server and setup error handlers.
            server
                .listen(port)
                .on('error', (err: { code: string; message: string }) => {
                    if (err.code === 'EADDRINUSE') {
                        Logger.error(
                            `Cannot start server on port ${port!}, address is already in use.`
                        );
                        Logger.error(
                            'Do you have a MUD server already running?'
                        );
                    } else if (err.code === 'EACCES') {
                        Logger.error(
                            `Cannot start server on port ${port!}: permission denied.`
                        );
                        Logger.error(
                            'Are you trying to start it on a privileged port without being root?'
                        );
                    } else {
                        Logger.error('Failed to start MUD server:');
                        Logger.error(err.message);
                    }

                    process.exit(1);
                });

            Logger.info(`Telnet server started on port: ${port!}...`);
        }) as StatefulListenerFactory<[GameServerStartupPayload]>,
};

export default evt;
