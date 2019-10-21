import BehaviorManager from '../behaviors/behavior-manager';
import {Behavior} from '../behaviors/behavior';

export abstract class EntityFactory<T, TDef> {
    protected _entities: Map<string, TDef> = new Map();
    protected _scripts: BehaviorManager = new BehaviorManager();

    public static createRef(areaName: string, id: number): string {
        return `${areaName}:${id}`;
    }

    public addScriptListener(ref: string, event: string, listener: Behavior): void {
        this._scripts.addListener(ref, event, listener);
    }

    public getDefinition(ref: string): TDef {
        return this._entities.get(ref);
    }

    public setDefinition(ref: string, def: TDef): void {
        this._entities.set(ref, def);
    }
}

export default EntityFactory;
