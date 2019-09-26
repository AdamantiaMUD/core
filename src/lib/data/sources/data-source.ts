/* eslint-disable @typescript-eslint/no-unused-vars, prefer-promise-reject-errors */
import DataSourceConfig from './data-source-config';
import Config from '../../util/config';

export class DataSource {
    /* eslint-disable lines-between-class-members */
    public name: string = '';

    protected readonly appConfig: Config;
    protected readonly config: DataSourceConfig;
    /* eslint-enable lines-between-class-members */

    public constructor(appConfig: Config) {
        this.appConfig = appConfig;
    }

    public hasData(config: DataSourceConfig): Promise<boolean> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public fetchAll(config: DataSourceConfig): Promise<any> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public fetch(config: DataSourceConfig, id: string): Promise<any> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public replace(config: DataSourceConfig, data: any): Promise<undefined> {
        return Promise.reject('This must be implemented in a sub-class.');
    }

    public update(config: DataSourceConfig, id: string, data: any): Promise<undefined> {
        return Promise.reject('This must be implemented in a sub-class.');
    }
}

export default DataSource;
