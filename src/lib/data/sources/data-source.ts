/* eslint-disable @typescript-eslint/no-unused-vars, prefer-promise-reject-errors */
import DataSourceConfig from './data-source-config';

export class DataSource {
    /* eslint-disable lines-between-class-members */
    public name: string = '';

    protected readonly config: DataSourceConfig;
    protected readonly root: string;
    /* eslint-enable lines-between-class-members */

    public constructor(rootPath: string) {
        this.root = rootPath;
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
