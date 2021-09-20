import {sprintf} from 'sprintf-js';

import GameEntity from './game-entity';
import Logger from '../common/logger';
import {clone} from '../util/objects';
import {hasValue} from '../util/functions';

import type BehaviorManager from '../behaviors/behavior-manager';
import type GameStateData from '../game-state-data';
import type ScriptableEntityDefinition from './scriptable-entity-definition';
import type SerializedScriptableEntity from './serialized-scriptable-entity';
import type SimpleMap from '../util/simple-map';

export class ScriptableEntity extends GameEntity {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    protected _behaviors: Map<string, SimpleMap | true | null>;
    protected _script: string | null;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(def?: ScriptableEntityDefinition) {
        super(def);

        this._behaviors = typeof def?.behaviors === 'undefined'
            ? new Map<string, SimpleMap | true | null>()
            : new Map<string, SimpleMap | true | null>(Object.entries(clone(def.behaviors)));

        this._script = def?.script ?? null;
    }

    /**
     * Attach this entity's behaviors from the manager
     * @param {BehaviorManager} manager
     */
    private _setupBehaviors(manager: BehaviorManager): void {
        /* eslint-disable-next-line prefer-const */
        for (let [name, config] of this._behaviors) {
            const behavior = manager.get(name);

            if (hasValue(behavior)) {
                // behavior may be a boolean in which case it will be `behaviorName: true`
                config = config === true ? {} : config;
                behavior.attach(this, config);
            }
            else {
                Logger.warn(sprintf(
                    'No script found for [%1$s] behavior `%2$s`',
                    this.constructor.name,
                    name
                ));
            }
        }
    }

    public get behaviors(): Map<string, SimpleMap | true | null> {
        return this._behaviors;
    }

    public getBehavior(name: string): SimpleMap | true | null {
        return this._behaviors.get(name) ?? null;
    }

    public hasBehavior(name: string): boolean {
        return this._behaviors.has(name);
    }

    public hydrate(state: GameStateData): void {
        super.hydrate(state);

        this._setupBehaviors(state.itemBehaviorManager);
    }

    public serialize(): SerializedScriptableEntity {
        const behaviors: {[key: string]: SimpleMap | true | null} = {};

        for (const [key, val] of this._behaviors) {
            behaviors[key] = val;
        }

        return {
            ...super.serialize(),

            /*
             * behaviors are serialized in case their config was modified during gameplay
             * and that state needs to persist (charges of a scroll remaining, etc)
             */
            behaviors,
        };
    }
}

export default ScriptableEntity;
