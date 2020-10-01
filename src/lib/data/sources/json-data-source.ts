import fs from 'fs';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';
import Logger from '../../util/logger';

/**
 * Data source when you have all entities in a single json file
 *
 * Config:
 *   path: string: relative path to .json file from project root
 */
class JsonDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<T> {
        const filepath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${filepath}] for JsonDataSource`);
        }

        return new Promise((resolve, reject) => {
            try {
                const realPath = fs.realpathSync(filepath);
                const contents = fs.readFileSync(realPath, 'utf8');

                resolve(JSON.parse(contents));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    public async fetch<T = unknown>(config: DataSourceConfig = {}, id: string): Promise<T> {
        const data = await this.fetchAll(config);

        if (!data.hasOwnProperty(id)) {
            throw new ReferenceError(`Record with id [${id}] not found.`);
        }

        return data[id];
    }

    public async replace<T = unknown>(config: DataSourceConfig = {}, data: T): Promise<T> {
        const filepath = this.resolvePath(config);

        return new Promise((resolve, reject) => {
            // eslint-disable-next-line no-magic-numbers
            fs.writeFile(filepath, JSON.stringify(data, null, 4), err => {
                if (err) {
                    reject(err);

                    return;
                }

                resolve();
            });
        });
    }

    public async update<T = unknown>(
        config: DataSourceConfig = {},
        id: string,
        data: T
    ): Promise<T> {
        const currentData = await this.fetchAll(config);

        if (Array.isArray(currentData)) {
            throw new TypeError('Yaml data stored as array, cannot update by id');
        }

        currentData[id] = data;

        return this.replace(config, currentData);
    }
}

export default JsonDataSource;
