import Character from '../entities/character';
import {isIterable} from '../util';

interface MudEventEmitter {
    dispatch: (evt: MudEventConstructor<any>) => void;
    listen: (name: string, listener: MudEventListener<any>, config?: any) => void;
    stopListening: (name: string) => void;
}

type MudEventListener<T> = (emitter: MudEventEmitter, args: T) => void;

// this.emit('gained-follower', follower);
// this.emit('equip', slot, item);
// this.emit('followed', target);
// player.emit('experience', xp);

interface MudEventConstructor<T> {
    new (props: T);
}

interface MudEvent {
    name: string;
}

const ExperienceEvent: MudEventConstructor<{amount: number}> = class ExperienceEvent implements MudEvent {
    public name: string = 'experience';
    public amount: number;

    constructor(props: {amount: number}) {
        this.amount = props.amount;
    }
};

type ExperienceEventListener = MudEventListener<{amount: number}>;

const GainedFollowerEvent: MudEventConstructor<{follower: Character}> = class GainedFollowerEvent implements MudEvent {
    public name: string = 'gained-follower';
    public follower: Character;

    constructor(props: {follower: Character}) {
        this.follower = props.follower;
    }
};


class MudEventManager {
    /**
     * key: string - The name of the event
     * value: Set<MudEventListener<unknown>> - The set of listeners to call when the event fires
     */
    private _events: Map<string, Set<MudEventListener<unknown>>> = new Map();

    public get size(): number {
        return this._events.size;
    }

    /**
     * Add a new listener for the given event. If no listeners have been
     * previously added for the event, it is first initialized with an empty set.
     */
    public add(name: string, listener: MudEventListener<unknown>): void {
        if (!this._events.has(name)) {
            this._events.set(name, new Set());
        }

        this._events.get(name).add(listener);
    }

    /**
     * Attach all currently added events to the given emitter
     */
    public attach(emitter: MudEventEmitter, config?: any): void {
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
    public detach(emitter: MudEventEmitter, eventNames: string | string[] = null): void {
        let events: string[] = [];

        if (typeof eventNames === 'string') {
            events = [eventNames];
        }
        else if (Array.isArray(eventNames)) {
            events = eventNames;
        }
        else if (!events) {
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
    public get(name: string): Set<MudEventListener<unknown>> {
        if (!this._events.has(name)) {
            return new Set();
        }

        return this._events.get(name);
    }
}
