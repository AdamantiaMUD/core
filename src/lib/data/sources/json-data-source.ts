/* eslint-disable-next-line id-length */
import fs from 'fs-extra';

import FileDataSource from './file-data-source';

import type DataSourceConfig from './data-source-config';

/**
 * Data source when you have all entities in a single json file
 *
 * Config:
 *   path: string: relative path to .json file from project root
 */
export class JsonDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<{[key: string]: T}> {
        const filepath = this.resolvePath(config);

        const hasData = await this.hasData(config);

        if (!hasData) {
            throw new Error(`Invalid path [${filepath}] for JsonDataSource`);
        }

        const realPath = fs.realpathSync(filepath);
        const contents = fs.readFileSync(realPath, 'utf8');

        return JSON.parse(contents) as {[key: string]: T};
    }

    public async fetch<T = unknown>(id: string, config: DataSourceConfig = {}): Promise<T> {
        const data = await this.fetchAll<T>(config);

        if (!(id in data)) {
            throw new ReferenceError(`Record with id [${id}] not found.`);
        }

        return data[id];
    }

    public async replace<T = unknown>(data: T, config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        try {
            // eslint-disable-next-line no-magic-numbers
            await fs.writeFile(filepath, JSON.stringify(data, null, 4));
        }
        catch {
            // @TODO: log error / return some message

            return false;
        }

        return true;
    }

    public async update<T = unknown>(
        id: string,
        data: T,
        config: DataSourceConfig = {}
    ): Promise<boolean> {
        const currentData = await this.fetchAll(config);

        if (Array.isArray(currentData)) {
            throw new TypeError('Yaml data stored as array, cannot update by id');
        }

        currentData[id] = data;

        return this.replace(config, currentData);
    }
}

export default JsonDataSource;
