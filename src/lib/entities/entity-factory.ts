import BehaviorManager from '../behaviors/behavior-manager';

import type GameEntity from './game-entity';
import type GameEntityDefinition from './game-entity-definition';
import type Behavior from '../behaviors/behavior';

export abstract class EntityFactory<T extends GameEntity, TDef extends GameEntityDefinition> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    protected _entities: Map<string, TDef> = new Map<string, TDef>();
    protected _scripts: BehaviorManager = new BehaviorManager();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public static createRef(areaName: string, id: string): string {
        return `${areaName}:${id}`;
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
