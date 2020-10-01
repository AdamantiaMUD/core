/* eslint-disable @typescript-eslint/no-unused-vars, prefer-promise-reject-errors */
import type DataSourceConfig from './data-source-config';
import type Config from '../../util/config';

export class DataSource {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public name: string = '';

    protected readonly appConfig: Config;
    protected readonly config: DataSourceConfig;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(appConfig: Config) {
        this.appConfig = appConfig;
    }

    public async hasData(config: DataSourceConfig): Promise<boolean> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig): Promise<T> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public async fetch<T = unknown>(config: DataSourceConfig, id: string): Promise<T> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public async replace<T = unknown>(config: DataSourceConfig, data: T): Promise<T> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public async update<T = unknown>(config: DataSourceConfig, id: string, data: T): Promise<T> {
        return Promise.reject('This must be implemented in a sub-class.');
    }
}

export default DataSource;
