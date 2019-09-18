import DataSource from './sources/data-source';

/**
 * Used to CRUD an entity from a configured DataSource
 */
export class EntityLoader {
    /* eslint-disable lines-between-class-members */
    private readonly config: {area?: string; bundle?: string};
    private readonly dataSource: DataSource;
    /* eslint-enable lines-between-class-members */

    public constructor(dataSource: DataSource, config = {}) {
        this.dataSource = dataSource;
        this.config = config;
    }

    public fetch(id: string): Promise<any> {
        return this.dataSource.fetch(this.config, id);
    }

    public fetchAll(): Promise<any> {
        return this.dataSource.fetchAll(this.config);
    }

    public hasData(): Promise<boolean> {
        return this.dataSource.hasData(this.config);
    }

    public replace(data: any): Promise<undefined> {
        return this.dataSource.replace(this.config, data);
    }

    public setArea(name: string): void {
        this.config.area = name;
    }

    public setBundle(name: string): void {
        this.config.bundle = name;
    }

    public update(id: string, data: any): Promise<undefined> {
        return this.dataSource.update(this.config, id, data);
    }
}

export default EntityLoader;
