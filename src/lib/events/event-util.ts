import type {EventEmitter} from 'events';

import Player from '../players/player';

import type TransportStream from '../communication/transport-stream';

/**
 * Helper methods for colored output during input-events
 */
export const EventUtil = {
    /**
     * Generate a function for writing colored output to a socket with a newline
     */
    genSay: (entity: Player | TransportStream<EventEmitter>): ((string) => boolean) => {
        let socket: TransportStream<EventEmitter> | null = null;

        if (entity instanceof Player) {
            socket = entity.socket;
        }
        else {
            socket = entity;
        }

        return (str: string): boolean => socket!.write(`${str}\r\n`);
    },

    /**
     * Generate a function for writing colored output to a socket
     */
    genWrite: (entity: Player | TransportStream<EventEmitter>): ((string) => boolean) => {
        let socket: TransportStream<EventEmitter> | null = null;

        if (entity instanceof Player) {
            socket = entity.socket;
        }
        else {
            socket = entity;
        }

        return (str: string): boolean => socket!.write(str);
    },
};

export default EventUtil;
