import type DataSource from './sources/data-source';

export interface EntityLoaderConfig {
    area?: string;
    bundle?: string;
}

/**
 * Used to CRUD an entity from a configured DataSource
 */
export class EntityLoader {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _config: EntityLoaderConfig;
    private readonly _dataSource: DataSource;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(dataSource: DataSource, config: EntityLoaderConfig = {}) {
        this._dataSource = dataSource;
        this._config = config;
    }

    public async fetch<T = unknown>(id: string): Promise<T> {
        return this._dataSource.fetch<T>(id, this._config);
    }

    public async fetchAll<T = unknown>(): Promise<{[key: string]: T}> {
        return this._dataSource.fetchAll<T>(this._config);
    }

    public async hasData(): Promise<boolean> {
        return this._dataSource.hasData(this._config);
    }

    public async replace<T = unknown>(data: T): Promise<boolean> {
        return this._dataSource.replace<T>(data, this._config);
    }

    public setArea(name: string): void {
        this._config.area = name;
    }

    public setBundle(name: string): void {
        this._config.bundle = name;
    }

    public async update<T = unknown>(id: string, data: T): Promise<boolean> {
        return this._dataSource.update<T>(id, data, this._config);
    }
}

export default EntityLoader;
