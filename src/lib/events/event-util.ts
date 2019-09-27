import sty from 'sty';
import {EventEmitter} from 'events';

import TransportStream from '../communication/transport-stream';

/**
 * Helper methods for colored output during input-events
 */
export class EventUtil {
    /**
     * Generate a function for writing colored output to a socket with a newline
     */
    public static genSay(socket: TransportStream<EventEmitter>): (string) => boolean {
        return (str: string): boolean => socket.write(sty.parse(`${str}\r\n`));
    }

    /**
     * Generate a function for writing colored output to a socket
     */
    public static genWrite(socket: TransportStream<EventEmitter>): (string) => boolean {
        return (str: string): boolean => socket.write(sty.parse(str));
    }
}

export default EventUtil;
