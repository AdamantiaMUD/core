import EventEmitter from 'events';

import GameState from '../game-state';
import SimpleMap from '../util/simple-map';

export class MudEvent<T> {
    public NAME: string = '';
    public payload: T;

    public constructor(props?: T) {
        if (typeof props === 'undefined') {
            return undefined;
        }

        this.payload = props;

        return new Proxy(this, {
            get: (obj: MudEvent<T>, prop: 'NAME' | 'payload' | keyof T): string | T | unknown => {
                switch (prop) {
                    case 'NAME':
                        return obj.NAME;

                    case 'payload':
                        return obj.payload;

                    default:
                        return obj.payload[prop];
                }
            },
        });
    }

    public static getName(): string {
        const inst = new this();

        return inst.NAME;
    }
}

export interface MudEventConstructor<T> {
    new (props?: T);
    getName?: () => string;
}

export class MudEventEmitter {
    protected _emitter: EventEmitter = new EventEmitter();

    public dispatch(event: MudEvent<unknown>): void {
        this._emitter.emit(event.NAME, event);
    }

    public listen<T>(eventKey: string, listener: MudEventListener<T>, config?: SimpleMap): void {
        this._emitter.on(eventKey, (data: T) => listener(this, data, config));
    }

    public stopListening(eventKey?: string): void {
        this._emitter.removeAllListeners(eventKey);
    }
}

export type MudEventListener<T> = (emitter: MudEventEmitter, args?: T, config?: SimpleMap) => void;

/* eslint-disable-next-line @typescript-eslint/no-type-alias */
export type MEL<T> = MudEventListener<T>;

export interface MudEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => MudEventListener<T>;
}
