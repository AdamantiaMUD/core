/* eslint-disable-next-line id-length */
import fs from 'fs';
import path from 'path';

import type {EventEmitter} from 'events';

import {BeginLoginEvent, IntroEvent} from '../lib/events';
import {hasValue} from '../../../lib/util/functions';

import type GameStateData from '../../../lib/game-state-data';
import type StreamEventListener from '../../../lib/events/stream-event-listener';
import type StreamEventListenerFactory from '../../../lib/events/stream-event-listener-factory';
import type TransportStream from '../../../lib/communication/transport-stream';

/**
 * MOTD event
 */
export const evt: StreamEventListenerFactory<void> = {
    name: IntroEvent.getName(),
    listener: (state: GameStateData): StreamEventListener<void> => (stream: TransportStream<EventEmitter>): void => {
        /*
         * MotD generated here:
         * http://patorjk.com/software/taag/#p=display&f=Caligraphy2&t=Adamantia%20MUD
         */
        const defaultMotdUri: string = path.join(__dirname, '..', 'resources', 'motd');
        const motdUri: string = state.config.get('motdUri', defaultMotdUri);

        const motd = fs.readFileSync(motdUri, 'utf8');

        if (hasValue(motd)) {
            stream.write(motd);
        }

        stream.dispatch(new BeginLoginEvent());
    },
};

export default evt;
