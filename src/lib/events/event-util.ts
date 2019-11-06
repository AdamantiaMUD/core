import EventEmitter from 'events';
import sty from 'sty';

import Player from '../players/player';
import TransportStream from '../communication/transport-stream';

/**
 * Helper methods for colored output during input-events
 */
export class EventUtil {
    /**
     * Generate a function for writing colored output to a socket with a newline
     */
    public static genSay(entity: Player | TransportStream<EventEmitter>): (string) => boolean {
        let socket: TransportStream<EventEmitter> = null;

        if (entity instanceof Player) {
            socket = entity.socket;
        }
        else {
            socket = entity;
        }

        return (str: string): boolean => socket.write(sty.parse(`${str}\r\n`));
    }

    /**
     * Generate a function for writing colored output to a socket
     */
    public static genWrite(entity: Player | TransportStream<EventEmitter>): (string) => boolean {
        let socket: TransportStream<EventEmitter> = null;

        if (entity instanceof Player) {
            socket = entity.socket;
        }
        else {
            socket = entity;
        }

        return (str: string): boolean => socket.write(sty.parse(str));
    }
}

export default EventUtil;
