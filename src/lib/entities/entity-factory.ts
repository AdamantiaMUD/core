export abstract class EntityFactory<T, TDef> {
    public entities: Map<string, TDef> = new Map();

    public static createRef(areaName: string, id: number): string {
        return `${areaName}:${id}`;
    }

    public getDefinition(ref: string): TDef {
        return this.entities.get(ref);
    }

    public setDefinition(ref: string, def: TDef): void {
        this.entities.set(ref, def);
    }
}

export default EntityFactory;
