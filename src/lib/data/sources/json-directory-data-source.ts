/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import FileDataSource from './file-data-source';
import JsonDataSource from './json-data-source';
import {cast} from '../../util/functions';

import type DataSourceConfig from './data-source-config';

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
export class JsonDirectoryDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<{[key: string]: T}> {
        const dirPath = this.resolvePath(config);

        const hasData = await this.hasData(config);

        if (!hasData) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        const data: {[key: string]: T} = {};

        const files: string[] = await fs.readdir(fs.realpathSync(dirPath));

        for (const file of files) {
            if (path.extname(file) === '.json') {
                const id = path.basename(file, '.json');

                // eslint-disable-next-line no-await-in-loop
                data[id] = await this.fetch(id, config);
            }
        }

        return data;
    }

    public async fetch<T = unknown>(id: string, config: DataSourceConfig = {}): Promise<T> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        const data = await source.fetchAll({path: path.join(dirPath, `${id}.json`)});

        return cast<T>(data);
    }

    public async replace<T = unknown>(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        data: T,
        config: DataSourceConfig = {}
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): Promise<boolean> {
        return Promise.reject(new Error('You cannot replace an entire directory'));
    }

    public async update<T = unknown>(id: string, data: T, config: DataSourceConfig = {}): Promise<boolean> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        return source.replace(data, {path: path.join(dirPath, `${id}.json`)});
    }
}

export default JsonDirectoryDataSource;
