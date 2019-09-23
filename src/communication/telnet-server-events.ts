// import {ServerEventListenersDefinition} from '@worldofpannotia/ranvier-core';

import GameState from '../game-state';
import Logger from '../util/logger';
import Options from './telnet/options';
import Sequences from './telnet/sequences';
import TelnetServer from './telnet/server';
import TelnetSocket from './telnet/telnet-socket';
import TelnetStream from './telnet/telnet-stream';

export const serverEvents: ServerEventListenersDefinition = {
    listeners: {
        startup: (state: GameState) => () => {
            // const {port} = commander;
            const port = 4000;

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
                state.InputEventManager.attach(stream);

                stream.write('Connecting...\n');
                Logger.log('User connected...');

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

            Logger.log(`Telnet server started on port: ${port}...`);
        },

        shutdown: () => () => {
            // no need to do anything special in shutdown
        },
    },
};

export default serverEvents;