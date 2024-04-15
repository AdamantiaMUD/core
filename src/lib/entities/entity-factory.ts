import BehaviorManager from '../behaviors/behavior-manager.js';

import type GameEntity from './game-entity.js';
import type GameEntityDefinition from './game-entity-definition.js';
import type Behavior from '../behaviors/behavior.js';

/* eslint-disable-next-line @typescript-eslint/no-unused-vars */
export abstract class EntityFactory<T extends GameEntity, TDef extends GameEntityDefinition> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    protected _entities: Map<string, TDef> = new Map<string, TDef>();
    protected _scripts: BehaviorManager = new BehaviorManager();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public static createRef(areaRef: string, id: string): string {
        return `${areaRef}:${id}`;
    }

    public get entities(): Map<string, TDef> {
        return this._entities;
    }

    public addScriptListener(ref: string, event: string, listener: Behavior): void {
        this._scripts.addListener(ref, event, listener);
    }

    public getDefinition(ref: string): TDef | null {
        return this._entities.get(ref) ?? null;
    }

    public setDefinition(ref: string, def: TDef): void {
        this._entities.set(ref, def);
    }
}

export default EntityFactory;
