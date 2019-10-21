import cloneFactory from 'rfdc';
import {sprintf} from 'sprintf-js';

import BehaviorManager from '../behaviors/behavior-manager';
import GameEntity, {
    GameEntityDefinition,
    SerializedGameEntity
} from './game-entity';
import Logger from '../util/logger';
import Serializable from '../data/serializable';
import {SimpleMap} from '../../../index';
import GameState from '../game-state';

const clone = cloneFactory();

export interface Scriptable {
    behaviors: Map<string, SimpleMap | true>;
    emit: (name: string | symbol, ...args: any[]) => boolean;
    getBehavior: (name: string) => SimpleMap | true;
    hasBehavior: (name: string) => boolean;
}

export interface ScriptableEntityDefinition extends GameEntityDefinition {
    behaviors?: {[key: string]: SimpleMap | true};
    script?: string;
}

export interface SerializedScriptableEntity extends SerializedGameEntity {
    behaviors: {[key: string]: SimpleMap | true};
}

export class ScriptableEntity extends GameEntity implements Scriptable, Serializable {
    protected _behaviors: Map<string, SimpleMap | true>;
    protected _script: string;

    public constructor(def?: ScriptableEntityDefinition) {
        super(def);

        this._behaviors = typeof def?.behaviors === 'undefined'
            ? new Map()
            : clone(def.behaviors);

        this._script = def?.script ?? null;
    }

    /**
     * Attach this entity's behaviors from the manager
     * @param {BehaviorManager} manager
     */
    private setupBehaviors(manager: BehaviorManager): void {
        /* eslint-disable-next-line prefer-const */
        for (let [name, config] of this._behaviors) {
            const behavior = manager.get(name);

            if (behavior) {
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

    public get behaviors(): Map<string, SimpleMap | true> {
        return this._behaviors;
    }

    public emit(name: string | symbol, ...args: any[]): boolean {
        /*
         * Squelch events on a pruned entity. Attempts to prevent the case
         * where an entity has been effectively removed from the game but
         * somehow still triggered a listener. Set by respective
         * EntityManager class
         */
        if (this.__pruned) {
            this.removeAllListeners();

            return false;
        }

        return super.emit(name, ...args);
    }

    public getBehavior(name: string): SimpleMap | true {
        return this._behaviors.get(name);
    }

    public hasBehavior(name: string): boolean {
        return this._behaviors.has(name);
    }

    public hydrate(state: GameState): void {
        super.hydrate(state);

        this.setupBehaviors(state.itemBehaviorManager);
    }

    public serialize(): SerializedScriptableEntity {
        const behaviors: {[key: string]: SimpleMap | true} = {};

        for (const [key, val] of this._behaviors) {
            behaviors[key] = val;
        }

        return {
            ...super.serialize(),

            /*
             * behaviors are serialized in case their config was modified during gameplay
             * and that state needs to persist (charges of a scroll remaining, etc)
             */
            behaviors: behaviors,
        };
    }
}

export default ScriptableEntity;
