import fs from 'fs';
import path from 'path';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';
import JsonDataSource from './json-data-source';

/**
 * Data source when you have a directory of json files and each entity is stored in
 * its own json file, e.g.,
 *
 *   foo/
 *     a.json
 *     b.json
 *     c.json
 *
 * Config:
 *   path: string: relative path to directory containing .json files from project root
 */
class JsonDirectoryDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<T> {
        const dirPath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        return new Promise((resolve, reject) => {
            const data = {};

            fs.readdir(fs.realpathSync(dirPath), async (err, files) => {
                if (err) {
                    reject(err);

                    return;
                }

                for (const file of files) {
                    if (path.extname(file) === '.json') {
                        const id = path.basename(file, '.json');

                        // eslint-disable-next-line no-await-in-loop
                        data[id] = await this.fetch(config, id);
                    }
                }

                resolve(data);
            });
        });
    }

    public async fetch<T = unknown>(config: DataSourceConfig = {}, id: string): Promise<T> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        return source.fetchAll({path: path.join(dirPath, `${id}.json`)});
    }

    public async replace<T = unknown>(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        config: DataSourceConfig = {},
        data: T
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): Promise<T> {
        return Promise.reject(new Error('You cannot replace an entire directory'));
    }

    public async update<T = unknown>(config: DataSourceConfig = {}, id: string, data: T): Promise<T> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }
        const source = new JsonDataSource(this.appConfig);

        return source.replace({path: path.join(dirPath, `${id}.json`)}, data);
    }
}

export default JsonDirectoryDataSource;
