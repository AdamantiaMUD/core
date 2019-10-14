import EventManager from '../events/event-manager';

/**
 * BehaviorManager keeps a map of BehaviorName:EventManager which is used
 * during Item and NPC hydrate() methods to attach events
 */
export class BehaviorManager {
    private readonly _behaviors: Map<string, EventManager> = new Map();

    public addListener(behaviorName: string, event: string, listener: Function): void {
        if (!this._behaviors.has(behaviorName)) {
            this._behaviors.set(behaviorName, new EventManager());
        }

        this._behaviors.get(behaviorName).add(event, listener);
    }

    public get(behaviorName: string): EventManager {
        if (!this._behaviors.has(behaviorName)) {
            this._behaviors.set(behaviorName, new EventManager());
        }

        return this._behaviors.get(behaviorName);
    }

    public has(behaviorName: string): boolean {
        return this._behaviors.has(behaviorName);
    }
}

export default BehaviorManager;
