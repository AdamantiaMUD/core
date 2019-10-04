import {sprintf} from 'sprintf-js';

import BehaviorManager from '../behaviors/behavior-manager';
import GameEntity from './game-entity';
import Logger from '../util/logger';
import {SimpleMap} from '../../../index';

export interface Scriptable {
    behaviors: Map<string, SimpleMap | boolean>;
    emit: (name: string | symbol, ...args: any[]) => boolean;
    getBehavior: (name: string) => SimpleMap | boolean;
    hasBehavior: (name: string) => boolean;
    setupBehaviors: (manager: BehaviorManager) => void;
}

export class ScriptableEntity extends GameEntity implements Scriptable {
    protected _behaviors: Map<string, SimpleMap | boolean>;
    protected _script: string;

    public get behaviors(): Map<string, SimpleMap | boolean> {
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

    public getBehavior(name: string): SimpleMap | boolean {
        return this._behaviors.get(name);
    }

    public hasBehavior(name: string): boolean {
        return this._behaviors.has(name);
    }

    /**
     * Attach this entity's behaviors from the manager
     * @param {BehaviorManager} manager
     */
    public setupBehaviors(manager: BehaviorManager): void {
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
}

export default ScriptableEntity;
