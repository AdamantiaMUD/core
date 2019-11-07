import EventEmitter from 'events';

import {AddressInfo} from 'net';
import {
    SocketDataEvent,
    SocketErrorEvent
} from '../../../lib/communication/socket-events';

import Sequences from './sequences';
import TelnetSocket from './telnet-socket';
import TransportStream from '../../../lib/communication/transport-stream';

/**
 * Thin wrapper around a @worldofpannotia/ranvier-telnet `TelnetSocket`
 */
export class TelnetStream extends TransportStream<TelnetSocket> {
    public address(): AddressInfo | string {
        return undefined;
    }

    public attach(socket: TelnetSocket): void {
        super.attach(socket);

        socket.on(new SocketDataEvent().getName(), (sock: TelnetSocket, message: string) => {
            this.emit('data', message);
        });

        socket.on(new SocketErrorEvent().getName(), (sock: TelnetSocket, err: string) => {
            this.emit('error', err);
        });

        this.socket.on('DO', (sock: TelnetSocket, opt: number | number[]) => {
            sock.telnetCommand(Sequences.WONT, opt);
        });
    }

    public destroy(): void {
    }

    public end(): void {
        this.socket.end();
    }

    public executeToggleEcho(): void {
        this.socket.toggleEcho();
    }

    public pause(): this {
        this.socket.pause();

        return this;
    }

    public resume(): this {
        this.socket.resume();

        return this;
    }

    public setEncoding(): this {
        return undefined;
    }

    public get writable(): boolean {
        return this.socket.writable;
    }

    public write(message: string, encoding: string = 'utf8'): boolean {
        if (!this.writable) {
            return false;
        }

        this.socket.write(message, encoding);

        return true;
    }
}

export default TelnetStream;
