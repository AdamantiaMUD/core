import type { AddressInfo } from 'net';
import type { EventEmitter } from 'events';

import { cast, hasValue } from '../util/functions.js';

import type StreamEvent from '../events/stream-event.js';
import type StreamEventListener from '../events/stream-event-listener.js';

/**
 * Base class for anything that should be sending or receiving data from the player
 */
export abstract class TransportStream<T extends EventEmitter> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private _prompted: boolean = false;

    public socket!: T;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public abstract address(): AddressInfo | string | null;

    public abstract end(): void;

    public abstract destroy(): void;

    public abstract pause(): this;

    public abstract resume(): this;

    public abstract setEncoding(): this;

    public abstract write(
        message: string,
        encoding?: string,
        includeNewline?: boolean
    ): boolean;

    public get prompted(): boolean {
        return this._prompted;
    }

    public get readable(): boolean {
        return true;
    }

    public get writable(): boolean {
        return true;
    }

    /**
     * Attach a socket to this stream
     */
    public attach(socket: T): void {
        this.socket = socket;
    }

    /**
     * A subtype-safe way to execute commands on a specific type of stream that
     * invalid types will ignore. For given input for command (example,
     * `"someCommand"` ill look for a method called `executeSomeCommand` on the
     * `TransportStream`
     */
    public command(command: string, ...args: unknown[]): unknown {
        if (!hasValue(command) || command.length === 0) {
            throw new RangeError('Must specify a command to the stream');
        }

        const cmd = `execute${command[0].toUpperCase()}${command.substr(1)}`;

        if (typeof this[cmd as keyof this] === 'function') {
            /* eslint-disable-next-line @typescript-eslint/ban-types */
            const func = cast<Function>(this[cmd as keyof this]).bind(
                this
            ) as Function;
            return func(...args);
        }

        return null;
    }

    public dispatch(event: StreamEvent<unknown>): void {
        this.socket.emit(event.NAME, event);
    }

    public listen<S>(eventKey: string, listener: StreamEventListener<S>): void {
        this.socket.on(eventKey, (data: S) => listener(this, data));
    }

    public setPrompted(prompted: boolean): void {
        this._prompted = prompted;
    }

    public stopListening(eventKey?: string): void {
        this.socket.removeAllListeners(eventKey);
    }
}

export default TransportStream;
