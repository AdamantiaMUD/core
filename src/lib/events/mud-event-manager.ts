import {hasValue} from '../util/functions';
import {isIterable} from '../util/objects';

import type MudEventEmitter from './mud-event-emitter';
import type MudEventListener from './mud-event-listener';
import type SimpleMap from '../util/simple-map';

export class MudEventManager {
    /**
     * key: string - The name of the event
     * value: Set<MudEventListener<unknown>> - The set of listeners to call when the event fires
     */
    private readonly _events: Map<string, Set<MudEventListener>> = new Map<string, Set<MudEventListener>>();

    public get size(): number {
        return this._events.size;
    }

    /**
     * Add a new listener for the given event. If no listeners have been
     * previously added for the event, it is first initialized with an empty set.
     */
    public add(name: string, listener: MudEventListener): void {
        if (!this._events.has(name)) {
            this._events.set(name, new Set());
        }

        this._events.get(name)!.add(listener);
    }

    /**
     * Attach all currently added events to the given emitter
     */
    public attach(emitter: MudEventEmitter, config?: SimpleMap | null): void {
        for (const [event, listeners] of this._events) {
            for (const listener of listeners) {
                emitter.listen(event, listener, config);
            }
        }
    }

    /**
     * Remove all listeners for a given emitter or only those for the given events
     * If no events are given it will remove all listeners from all events defined
     * in this manager.
     *
     * Warning: This will remove _all_ listeners for a given event list, this includes
     * listeners not in this manager but attached to the same event
     */
    public detach(emitter: MudEventEmitter, eventNames: string | string[] | null = null): void {
        let events: string[] = [];

        if (typeof eventNames === 'string') {
            events = [eventNames];
        }
        else if (Array.isArray(eventNames)) {
            events = eventNames;
        }
        else if (!hasValue(events)) {
            events = [...this._events.keys()];
        }
        else if (!isIterable(events)) {
            throw new TypeError('events list passed to detach() is not iterable');
        }

        for (const event of events) {
            emitter.stopListening(event);
        }
    }

    /**
     * Fetch all listeners for a given event
     */
    public get(name: string): Set<MudEventListener> {
        return this._events.get(name) ?? new Set();
    }
}

export default MudEventManager;
