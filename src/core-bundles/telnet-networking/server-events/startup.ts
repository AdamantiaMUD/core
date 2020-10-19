import Logger from '../../../lib/common/logger';
import Options from '../lib/options';
import Sequences from '../lib/sequences';
import TelnetServer from '../lib/server';
import TelnetSocket from '../lib/telnet-socket';
import TelnetStream from '../lib/telnet-stream';
import {GameServerStartupEvent} from '../../../lib/game-server/events';
import {IntroEvent} from '../../input-events/lib/events';

import type AdamantiaSocket from '../../../lib/communication/adamantia-socket';
import type GameState from '../../../lib/game-state';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type {GameServerStartupPayload} from '../../../lib/game-server/events';

const DEFAULT_TELNET_PORT = 4000;

export const evt: MudEventListenerDefinition<[GameServerStartupPayload]> = {
    name: GameServerStartupEvent.getName(),
    listener: (state: GameState): MudEventListener<[GameServerStartupPayload]> => (): void => {
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

            stream.write('Connecting...\n');

            Logger.info('User connected...');

            stream.dispatch(new IntroEvent());
        }).netServer;

        // Start the server and setup error handlers.
        server.listen(port)
            .on('error', (err: {code: string; message: string}) => {
                if (err.code === 'EADDRINUSE') {
                    Logger.error(`Cannot start server on port ${port}, address is already in use.`);
                    Logger.error('Do you have a MUD server already running?');
                }
                else if (err.code === 'EACCES') {
                    Logger.error(`Cannot start server on port ${port}: permission denied.`);
                    Logger.error('Are you trying to start it on a privileged port without being root?');
                }
                else {
                    Logger.error('Failed to start MUD server:');
                    Logger.error(err.message);
                }

                process.exit(1);
            });

        Logger.info(`Telnet server started on port: ${port}...`);
    },
};

export default evt;
