import MudEventManager from '../events/mud-event-manager.js';

import type MudEventListener from '../events/mud-event-listener.js';

/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
export class BehaviorManager {
    private readonly _behaviors: Map<string, MudEventManager> = new Map<
        string,
        MudEventManager
    >();

    public addListener<T extends unknown[]>(
        behaviorName: string,
        event: string,
        listener: MudEventListener<T>
    ): void {
        if (!this._behaviors.has(behaviorName)) {
            this._behaviors.set(behaviorName, new MudEventManager());
        }

        // @TODO: figure this sh!t out
        /* eslint-disable-next-line */
        /* @ts-ignore */
        this._behaviors.get(behaviorName)!.add(event, listener);
    }

    public get(behaviorName: string): MudEventManager {
        if (!this._behaviors.has(behaviorName)) {
            this._behaviors.set(behaviorName, new MudEventManager());
        }

        return this._behaviors.get(behaviorName)!;
    }

    public has(behaviorName: string): boolean {
        return this._behaviors.has(behaviorName);
    }
}

export default BehaviorManager;
