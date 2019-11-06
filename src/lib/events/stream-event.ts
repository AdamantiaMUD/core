import EventEmitter from 'events';

import GameState from '../game-state';
import TransportStream from '../communication/transport-stream';

export class StreamEvent<T> {
    public NAME: string = '';

    constructor(props?: T) {
        if (typeof props === 'undefined') {
            return;
        }

        const keys = Object.getOwnPropertyNames.call(props);

        for (let key of keys) {
            this[key] = props[key];
        }
    }

    getName(): string {
        return this.NAME;
    }
}

export interface StreamEventConstructor<T> {
    new (props?: T);
    getName?: () => string;
}

export type StreamEventListener<T> = (socket: TransportStream<EventEmitter>, args?: T) => void;

export interface StreamEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => StreamEventListener<T>;
}
