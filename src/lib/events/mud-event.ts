import EventEmitter from 'events';

import GameState from '../game-state';
import SimpleMap from '../util/simple-map';

export class MudEvent<T> {
    public NAME: string = '';
    public payload: T;

    constructor(props?: T) {
        if (typeof props === 'undefined') {
            return;
        }

        this.payload = props;

        return new Proxy(this, {
            get: (obj: MudEvent<T>, prop: 'NAME' | 'getName' | 'payload' | keyof T) => {
                switch (prop) {
                    case 'NAME':
                        return obj.NAME;

                    case 'getName':
                        return obj.getName;

                    case 'payload':
                        return obj.payload;

                    default:
                        return obj.payload[prop];
                }
            },
        });
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
