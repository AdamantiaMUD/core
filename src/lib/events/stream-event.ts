import EventEmitter from 'events';

import GameState from '../game-state';
import SimpleMap from '../util/simple-map';

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

export class StreamEventEmitter {
    protected _emitter: EventEmitter = new EventEmitter();

    public dispatch(event: StreamEvent<unknown>): void {
        this._emitter.emit(event.getName(), event);
    }

    public listen<T>(eventKey: string, listener: StreamEventListener<T>, config?: any): void {
        this._emitter.on(eventKey, (data: T) => listener(this, data, config));
    }

    public stopListening(eventKey?: string): void {
        this._emitter.removeAllListeners(eventKey);
    };
}

export type StreamEventListener<T> = (emitter: StreamEventEmitter, args?: T, config?: SimpleMap) => void;

export interface StreamEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => StreamEventListener<T>;
}
