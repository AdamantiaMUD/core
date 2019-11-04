import sty from 'sty';

import Player from '../players/player';

/**
 * Helper methods for colored output during input-events
 */
export class EventUtil {
    /**
     * Generate a function for writing colored output to a socket with a newline
     */
    public static genSay(player: Player): (string) => boolean {
        return (str: string): boolean => player.socket.write(sty.parse(`${str}\r\n`));
    }

    /**
     * Generate a function for writing colored output to a socket
     */
    public static genWrite(player: Player): (string) => boolean {
        return (str: string): boolean => player.socket.write(sty.parse(str));
    }
}

export default EventUtil;
