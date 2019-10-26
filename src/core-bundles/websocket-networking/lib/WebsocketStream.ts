import {AddressInfo} from "net";
import WebSocket from 'ws';

import TransportStream from '../../../lib/communication/transport-stream';

/**
 * Essentially we want to look at the methods of WebSocket and match them to the
 * appropriate methods on TransportStream
 */
export class WebsocketStream extends TransportStream<WebSocket> {
    public get writable(): boolean {
        return this.socket.readyState === 1;
    }

    public address(): AddressInfo | string {
        return 'web-socket';
    }

    public attach(socket: WebSocket): void {
        super.attach(socket);

        // websocket uses 'message' instead of the 'data' event net.Socket uses
        socket.on('message', message => {
            this.emit('data', message);
        });
    }

    public destroy(): void {}

    public end(): void {
        // 1000 = normal close, no error
        this.socket.close(1000);
    }

    public executeSendData(group, data): void {
        if (!this.writable) {
            return;
        }

        this.socket.send(JSON.stringify({
            type: 'data',
            group: group,
            data: data,
        }));
    }

    public pause(): this {
        // pause() is not supported on Web Sockets
        return this;
    }

    public resume(): this {
        // resume() is not supported on Web Sockets
        return this;
    }

    public setEncoding(): this {
        return this;
    }

    public write(message: string): boolean {
        if (!this.writable) {
            return false;
        }

        // this.socket will be set when we do `ourWebsocketStream.attach(websocket)`
        this.socket.send(JSON.stringify({
            type: 'message',
            message: message,
        }));

        return true;
    }
}

export default WebsocketStream;
