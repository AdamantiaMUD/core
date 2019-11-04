import WebSocket from 'ws';

import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import {GameServerStartupEvent, GameServerStartupPayload} from '../../../lib/game-server-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

// import our adapter
import WebsocketStream from '../lib/WebsocketStream';

const DEFAULT_WEBSOCKET_PORT = 4001;

export const evt: MudEventListenerFactory<GameServerStartupPayload> = {
    name: GameServerStartupEvent.getName(),
    listener: (state: GameState): MudEventListener<GameServerStartupPayload> => () => {
        const port = state.config.get('port.websocket', DEFAULT_WEBSOCKET_PORT);

        // create a new websocket server using the port command line argument
        const wss = new WebSocket.Server({port});

        // This creates a super basic "echo" websocket server
        /* eslint-disable-next-line id-length */
        wss.on('connection', ws => {
            // create our adapter
            const stream = new WebsocketStream();

            // and attach the raw websocket
            stream.attach(ws);

            // Register all of the input events (login, etc.)
            state.inputEventManager.attach(stream);

            stream.write('Connecting...\n');
            Logger.info('User connected via websocket...');

            // @see: bundles/ranvier-events/events/login.js
            stream.emit('intro', stream);
        });

        Logger.info(`Websocket server started on port: ${wss.options.port}...`);
    },
};

export default evt;
