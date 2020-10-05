import WebSocket from 'ws';

import GameStateData from '../../../lib/game-state-data';
import Logger from '../../../lib/util/logger';
import {GameServerStartupEvent, GameServerStartupPayload} from '../../../lib/game-server-events';
import {MudEventListener, MudEventListenerDefinition} from '../../../lib/events/mud-event';
import {StreamIntroEvent} from '../../../core-bundles/input-events/input-events/intro';

// import our adapter
import WebsocketStream from '../lib/WebsocketStream';

const DEFAULT_WEBSOCKET_PORT = 4001;

export const evt: MudEventListenerDefinition<GameServerStartupPayload> = {
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
            state.streamEventManager.attach(stream);

            stream.write('Connecting...\n');
            Logger.info('User connected via websocket...');

            stream.dispatch(new StreamIntroEvent());
        });

        Logger.info(`Websocket server started on port: ${wss.options.port}...`);
    },
};

export default evt;
