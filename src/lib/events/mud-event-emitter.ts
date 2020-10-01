import {EventEmitter} from 'events';

import type MudEvent from './mud-event';
import type MudEventEmitterInterface from './mud-event-emitter-interface';
import type MudEventListener from './mud-event-listener';
import type SimpleMap from '../util/simple-map';

export default class MudEventEmitter implements MudEventEmitterInterface {
    protected _emitter: EventEmitter = new EventEmitter();

    public dispatch<T = unknown>(event: MudEvent<T>): void {
        this._emitter.emit(event.NAME, event);
    }

    public listen<T = unknown>(eventKey: string, listener: MudEventListener<T>, config?: SimpleMap): void {
        this._emitter.on(eventKey, (data: T) => listener(this, data, config));
    }

    public stopListening(eventKey?: string): void {
        this._emitter.removeAllListeners(eventKey);
    }
}
