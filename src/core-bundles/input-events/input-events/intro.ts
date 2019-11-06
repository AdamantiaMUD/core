import EventEmitter from 'events';
import fs from 'fs';
import path from 'path';

import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {
    StreamEvent,
    StreamEventConstructor,
    StreamEventListener,
    StreamEventListenerFactory,
} from '../../../lib/events/stream-event';
import {StreamLoginEvent} from './login';

export const StreamIntroEvent: StreamEventConstructor<never> = class extends StreamEvent<never> {
    public static NAME: string = 'stream-intro';
};

/**
 * MOTD event
 */
export const evt: StreamEventListenerFactory<never> = {
    name: StreamIntroEvent.getName(),
    listener: (state: GameState): StreamEventListener<never> => (socket: TransportStream<EventEmitter>) => {
        // MotD generated here:
        // http://patorjk.com/software/taag/#p=display&f=Caligraphy2&t=Adamantia%20MUD
        const defaultMotdUri: string = path.join(__dirname, '..', 'resources', 'motd');
        const motdUri: string = state.config.get('motdUri', defaultMotdUri);

        const motd = fs.readFileSync(motdUri, 'utf8');

        if (motd) {
            EventUtil.genSay(socket)(motd);
        }

        socket.dispatch(new StreamLoginEvent());
    },
};

export default intro;
