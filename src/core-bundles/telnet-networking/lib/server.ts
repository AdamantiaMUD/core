import {createServer} from 'net';

import type {Server} from 'net';

import type AdamantiaSocket from '../../../lib/communication/adamantia-socket';

class TelnetServer {
    public netServer: Server;

    /**
     * @param {function} listener   connected callback
     * @param {Object}   options options for the stream @see TelnetSocket
     */
    public constructor(
        listener: (socket: AdamantiaSocket) => void,
        options: {allowHalfOpen?: boolean; pauseOnConnect?: boolean} = {}
    ) {
        this.netServer = createServer(options, (socket: AdamantiaSocket) => {
            /* eslint-disable-next-line no-param-reassign */
            socket.fresh = true;
            listener(socket);
        });
    }
}

export default TelnetServer;
