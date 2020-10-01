import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';

import EventUtil from '../../../lib/events/event-util';
import GameStateData from '../../../lib/game-state-data';
import TransportStream from '../../../lib/communication/transport-stream';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {StreamLoginEvent} from './login';

export const StreamIntroEvent: StreamEventConstructor<void> = class extends StreamEvent<void> {
    public NAME: string = 'stream-intro';
};

/**
 * MOTD event
 */
export const evt: StreamEventListenerFactory<void> = {
    name: StreamIntroEvent.getName(),
    listener: (state: GameState): StreamEventListener<void> => (stream: TransportStream<EventEmitter>) => {
        /*
         * MotD generated here:
         * http://patorjk.com/software/taag/#p=display&f=Caligraphy2&t=Adamantia%20MUD
         */
        const defaultMotdUri: string = path.join(__dirname, '..', 'resources', 'motd');
        const motdUri: string = state.config.get('motdUri', defaultMotdUri);

        const motd = fs.readFileSync(motdUri, 'utf8');

        if (motd) {
            EventUtil.genSay(stream)(motd);
        }

        stream.dispatch(new StreamLoginEvent());
    },
};

export default evt;
