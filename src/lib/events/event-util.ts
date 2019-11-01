import sty from 'sty';

import TransportStream from '../communication/transport-stream';
import {MudEventEmitter} from './mud-event';

/**
 * Helper methods for colored output during input-events
 */
export class EventUtil {
    /**
     * Generate a function for writing colored output to a socket with a newline
     */
    public static genSay(socket: TransportStream<MudEventEmitter>): (string) => boolean {
        return (str: string): boolean => socket.write(sty.parse(`${str}\r\n`));
    }

    /**
     * Generate a function for writing colored output to a socket
     */
    public static genWrite(socket: TransportStream<MudEventEmitter>): (string) => boolean {
        return (str: string): boolean => socket.write(sty.parse(str));
    }
}

export default EventUtil;
