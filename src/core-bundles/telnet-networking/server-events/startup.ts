import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import Options from '../lib/options';
import Sequences from '../lib/sequences';
import TelnetServer from '../lib/server';
import TelnetSocket from '../lib/telnet-socket';
import TelnetStream from '../lib/telnet-stream';
import {GameServerStartupEvent, GameServerStartupPayload} from '../../../lib/game-server-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

const DEFAULT_TELNET_PORT = 4000;

export const evt: MudEventListenerFactory<GameServerStartupPayload> = {
    name: GameServerStartupEvent.getName(),
    listener: (state: GameState): MudEventListener<GameServerStartupPayload> => () => {
        const port = state.config.get('port.telnet', DEFAULT_TELNET_PORT);

        /**
         * Effectively the 'main' game loop but not really because it's a REPL
         */
        const server = new TelnetServer(rawSocket => {
            const telnetSocket = new TelnetSocket();

            telnetSocket.attach(rawSocket);
            telnetSocket.telnetCommand(Sequences.WILL, Options.OPT_EOR);

            const stream = new TelnetStream();

            stream.attach(telnetSocket);

            stream.on('interrupt', () => {
                stream.write('\n*interrupt*\n');
            });

            stream.on('error', err => {
                if (err.errno === 'EPIPE') {
                    /* eslint-disable-next-line max-len */
                    Logger.error('EPIPE on write. A websocket client probably connected to the telnet port.');

                    return;
                }

                Logger.error(err);
            });

            // Register all of the input events (login, etc.)
            state.attachServerStream(stream);

            stream.write('Connecting...\n');
            Logger.info('User connected...');

            // @see: bundles/ranvier-events/events/login.js
            stream.emit('intro', stream);
        }).netServer;

        // Start the server and setup error handlers.
        server.listen(port)
            .on('error', (err: {code: string; message: string}) => {
                if (err.code === 'EADDRINUSE') {
                    /* eslint-disable-next-line max-len */
                    Logger.error(`Cannot start server on port ${port}, address is already in use.`);
                    Logger.error('Do you have a MUD server already running?');
                }
                else if (err.code === 'EACCES') {
                    Logger.error(`Cannot start server on port ${port}: permission denied.`);
                    /* eslint-disable-next-line max-len */
                    Logger.error('Are you trying to start it on a privileged port without being root?');
                }
                else {
                    Logger.error('Failed to start MUD server:');
                    Logger.error(err.message);
                }

                /* eslint-disable-next-line no-process-exit */
                process.exit(1);
            });

        Logger.info(`Telnet server started on port: ${port}...`);
    },
};

export default evt;
