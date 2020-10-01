import {AddressInfo} from 'net';

import Sequences from './sequences';
import TelnetSocket from './telnet-socket';
import TransportStream from '../../../lib/communication/transport-stream';

/**
 * Thin wrapper around a @worldofpannotia/ranvier-telnet `TelnetSocket`
 */
export class TelnetStream extends TransportStream<TelnetSocket> {
    public address(): AddressInfo | string | null {
        return null;
    }

    public attach(socket: TelnetSocket): void {
        super.attach(socket);

        this.socket.on('DO', (opt: number | number[]) => {
            this.socket.telnetCommand(Sequences.WONT, opt);
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
