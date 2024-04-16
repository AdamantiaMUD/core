import { EventEmitter } from 'events';

import { cast } from '../util/functions.js';

import type MudEvent from './mud-event.js';
import type MudEventListener from './mud-event-listener.js';
import type SimpleMap from '../util/simple-map.js';

export abstract class MudEventEmitter {
    protected _emitter: EventEmitter = new EventEmitter();

    public dispatch<T = unknown>(event: MudEvent<T>): void {
        this._emitter.emit(event.NAME, event);
    }

    public listen<Entity extends MudEventEmitter, T = unknown>(
        eventKey: string,
        listener: MudEventListener<[Entity, T, SimpleMap | null | undefined]>,
        config?: SimpleMap | null
    ): void {
        this._emitter.on(eventKey, (data: T) =>
            listener(cast<Entity>(this), data, config)
        );
    }

    public stopListening(eventKey?: string): void {
        this._emitter.removeAllListeners(eventKey);
    }
}

export default MudEventEmitter;
