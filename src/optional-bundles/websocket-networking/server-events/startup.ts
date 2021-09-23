import WebSocket from 'ws';

import Logger from '../../../lib/common/logger';
import {GameServerStartupEvent} from '../../../lib/game-server/events';
import {IntroEvent} from '../../../core-bundles/input-events/lib/events';

import type GameStateData from '../../../lib/game-state-data';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type {GameServerStartupPayload} from '../../../lib/game-server/events';

// import our adapter
import WebsocketStream from '../lib/WebsocketStream';

const DEFAULT_WEBSOCKET_PORT = 4001;

export const evt: MudEventListenerDefinition<[GameServerStartupPayload]> = {
    name: GameServerStartupEvent.getName(),
    listener: (state: GameStateData): MudEventListener<[GameServerStartupPayload]> => (): void => {
        const port = state.config.getPort('websocket', DEFAULT_WEBSOCKET_PORT);

        // create a new websocket server using the port command line argument
        const wss = new WebSocket.Server({port});

        // This creates a super basic "echo" websocket server
        /* eslint-disable-next-line id-length */
        wss.on('connection', (ws: WebSocket) => {
            // create our adapter
            const stream = new WebsocketStream();

            // and attach the raw websocket
            stream.attach(ws);

            // Register all of the input events (login, etc.)
            state.streamEventManager.attach(stream);

            stream.write('Connecting...');
            Logger.info('User connected via websocket...');

            stream.dispatch(new IntroEvent());
        });

        Logger.info(`Websocket server started on port: ${wss.options.port!}...`);
    },
};

export default evt;
