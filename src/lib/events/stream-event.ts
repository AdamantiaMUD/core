import EventEmitter from 'events';

import GameStateData from '../game-state-data';
import TransportStream from '../communication/transport-stream';

export class StreamEvent<T> {
    public NAME: string = '';
    public payload: T;

    constructor(props?: T) {
        if (typeof props === 'undefined') {
            return;
        }

        this.payload = props;

        return new Proxy(this, {
            get: (obj: StreamEvent<T>, prop: 'NAME' | 'getName' | 'payload' | keyof T) => {
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

export interface StreamEventConstructor<T> {
    new (props?: T);
    getName?: () => string;
}

export type StreamEventListener<T> = (socket: TransportStream<EventEmitter>, args?: T) => void;

export interface StreamEventListenerFactory<T> {
    name: string;
    listener: (state?: GameState) => StreamEventListener<T>;
}
