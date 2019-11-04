import EventEmitter from 'events';

import GameState from '../game-state';
import SimpleMap from '../util/simple-map';

export class MudEvent<T> {
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

export interface MudEventConstructor<T> {
    new (props?: T);
    getName?: () => string;
}

export class MudEventEmitter {
    protected _emitter: EventEmitter = new EventEmitter();

    public dispatch(event: MudEvent<unknown>): void {
        this._emitter.emit(event.getName(), event);
    }

    public listen<T>(eventKey: string, listener: MudEventListener<T>, config?: any): void {
        this._emitter.on(eventKey, (data: T) => listener(this, data, config));
    }

    public stopListening(eventKey?: string): void {
        this._emitter.removeAllListeners(eventKey);
    };
}

export type MudEventListener<T> = (emitter: MudEventEmitter, args?: T, config?: SimpleMap) => void;

export interface MudEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => MudEventListener<T>;
}
