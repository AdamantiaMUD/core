/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';

import type {Dirent} from 'fs';

import FileDataSource from './file-data-source';
import YamlDataSource from './yaml-data-source';
import {cast} from '../../util/functions';

import type DataSourceConfig from './data-source-config';

/**
 * Data source for areas stored in yml. Looks for a directory structure like:
 *
 *   path/
 *     area-one/
 *       manifest.yml
 *     area-two/
 *       manifest.yml
 *
 * Config:
 *   path: string: relative path to directory containing area folders
 */
export class YamlAreaDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const dirPath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(dirPath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<{[key: string]: T}> {
        const dirPath = this.resolvePath(config);

        const hasData = await this.hasData(config);

        if (!hasData) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        const data: {[key: string]: T} = {};

        const files: Dirent[] = await fs.readdir(fs.realpathSync(dirPath), {withFileTypes: true});

        for (const file of files) {
            const manifestPath = path.join(dirPath, file.name, 'manifest.yml');

            if (file.isDirectory() && fs.existsSync(manifestPath)) {
                /* eslint-disable-next-line no-await-in-loop */
                data[file.name] = await this.fetch(file.name, config);
            }
        }

        return data;
    }

    public async fetch<T = unknown>(id: string, config: DataSourceConfig = {}): Promise<T> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        const source = new YamlDataSource(this.appConfig);

        const data = await source.fetchAll({path: path.join(dirPath, id, 'manifest.yml')});

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
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        const source = new YamlDataSource(this.appConfig);

        return source.replace({path: path.join(dirPath, id, 'manifest.yml')}, data);
    }
}

export default YamlAreaDataSource;
