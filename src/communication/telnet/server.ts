import {createServer, Server} from 'net';

import Socket from '../socket';

class TelnetServer {
    public netServer: Server;

    /**
     * @param {function} listener   connected callback
     * @param {object}   options options for the stream @see TelnetSocket
     */
    public constructor(listener: Function, options = {}) {
        this.netServer = createServer(options, (socket: Socket) => {
            socket.fresh = true;
            listener(socket);
        });
    }
}

export default TelnetServer;
