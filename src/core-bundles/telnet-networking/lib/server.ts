import {createServer, Server} from 'net';

import AdamantiaSocket from '../../../lib/communication/adamantia-socket';

class TelnetServer {
    public netServer: Server;

    /**
     * @param {function} listener   connected callback
     * @param {object}   options options for the stream @see TelnetSocket
     */
    public constructor(listener: Function, options = {}) {
        this.netServer = createServer(options, (socket: AdamantiaSocket) => {
            socket.fresh = true;
            listener(socket);
        });
    }
}

export default TelnetServer;
