import BehaviorManager from '../behaviors/behavior-manager';

export abstract class EntityFactory<T, TDef> {
    protected _entities: Map<string, TDef> = new Map();
    protected _scripts: BehaviorManager = new BehaviorManager();

    public static createRef(areaName: string, id: number): string {
        return `${areaName}:${id}`;
    }

    public getDefinition(ref: string): TDef {
        return this._entities.get(ref);
    }

    public setDefinition(ref: string, def: TDef): void {
        this._entities.set(ref, def);
    }
}

export default EntityFactory;
