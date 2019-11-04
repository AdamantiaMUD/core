import fs from 'fs';
import path from 'path';
import {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import GameState from '../../../lib/game-state';
import TransportStream from '../../../lib/communication/transport-stream';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

/**
 * MOTD event
 */
export const evt: MudEventListenerFactory<> = {
export const intro: InputEventListenerDefinition = {
    event: (state: GameState) => (socket: TransportStream<EventEmitter>) => {
        // MotD generated here:
        // http://patorjk.com/software/taag/#p=display&f=Caligraphy2&t=Adamantia%20MUD
        const defaultMotdUri: string = path.join(__dirname, '..', 'resources', 'motd');
        const motdUri: string = state.config.get('motdUri', defaultMotdUri);

        const motd = fs.readFileSync(motdUri, 'utf8');

        if (motd) {
            EventUtil.genSay(socket)(motd);
        }

        socket.emit('login');
    },
};

export default intro;
