import type {AddressInfo} from 'net';
import type {ExecFileOptionsWithOtherEncoding} from 'child_process';

import Sequences from './sequences';
import TransportStream from '../../../lib/communication/transport-stream';
import {colorize} from '../../../lib/util/communication';

import type TelnetSocket from './telnet-socket';

type BufferEncoding = ExecFileOptionsWithOtherEncoding['encoding'];

/**
 * Thin wrapper around a @worldofpannotia/ranvier-telnet `TelnetSocket`
 */
export class TelnetStream extends TransportStream<TelnetSocket> {
    public address(): AddressInfo | string | null {
        return null;
    }

    public attach(socket: TelnetSocket): void {
        super.attach(socket);

        this.socket.on('DO', (opt: number[] | number) => {
            this.socket.telnetCommand(Sequences.WONT, opt);
        });
    }

    /* eslint-disable-next-line @typescript-eslint/no-empty-function */
    public destroy(): void {}

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
        return this;
    }

    public get writable(): boolean {
        return this.socket.writable;
    }

    public write(message: string, encoding: BufferEncoding = 'utf8', includeNewline: boolean = true): boolean {
        if (!this.writable) {
            return false;
        }

        const msg = includeNewline ? `${message}\n` : message;

        this.socket.write(colorize(msg), encoding);

        return true;
    }
}

export default TelnetStream;
