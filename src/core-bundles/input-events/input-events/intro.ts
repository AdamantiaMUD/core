/* eslint-disable-next-line id-length */
import type { EventEmitter } from 'events';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import type TransportStream from '../../../lib/communication/transport-stream.js';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory.js';
import type StreamEventListener from '../../../lib/events/stream-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import { hasValue } from '../../../lib/util/functions.js';
import { BeginLoginEvent, IntroEvent } from '../lib/events/index.js';

/* eslint-disable-next-line @typescript-eslint/naming-convention, id-match */
const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * MOTD event
 */
export const evt: StreamEventListenerFactory<void> = {
    name: IntroEvent.getName(),
    listener:
        (state: GameStateData): StreamEventListener<void> =>
        (stream: TransportStream<EventEmitter>): void => {
            /*
             * MotD generated here:
             * http://patorjk.com/software/taag/#p=display&f=Caligraphy2&t=Adamantia%20MUD
             */
            const defaultMotdUri: string = path.join(
                __dirname,
                '..',
                'resources',
                'motd'
            );
            const motdUri: string = state.config.get(
                'motdUri',
                defaultMotdUri
            )!;

            const motd = fs.readFileSync(motdUri, 'utf8');

            if (hasValue(motd)) {
                stream.write(motd);
                stream.write('');
            }

            stream.dispatch(new BeginLoginEvent());
        },
};

export default evt;
