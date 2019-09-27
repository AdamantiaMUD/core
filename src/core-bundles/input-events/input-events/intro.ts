import fs from 'fs';
import {EventEmitter} from 'events';

import EventUtil from '../../../lib/events/event-util';
import TransportStream from '../../../lib/communication/transport-stream';
import {InputEventListenerDefinition} from '../../../lib/events/input-events';

/**
 * MOTD event
 */
export const intro: InputEventListenerDefinition = {
    event: () => (socket: TransportStream<EventEmitter>) => {
        const motd: string = fs.readFileSync(`${__dirname}/../resources/motd`, 'utf8');

        if (motd) {
            EventUtil.genSay(socket)(motd);
        }

        socket.emit('login');
    },
};

export default intro;
