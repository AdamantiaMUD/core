/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

import FileDataSource from './file-data-source';
import Logger from '../../common/logger';

import type DataSourceConfig from './data-source-config';

/**
 * Data source when you have all entities in a single yaml file
 *
 * Config:
 *   path: string: relative path to .yml file from project root
 */
export class YamlDataSource extends FileDataSource {
    public async hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public async fetchAll<T = unknown>(config: DataSourceConfig = {}): Promise<{[key: string]: T}> {
        const filepath = this.resolvePath(config);

        const hasData = await this.hasData(config);

        if (!hasData) {
            throw new Error(`Invalid path [${filepath}] for YamlDataSource`);
        }

        try {
            const realPath = fs.realpathSync(filepath);

            Logger.verbose(`Loading file '${realPath}'`);

            const contents = fs.readFileSync(realPath, 'utf8');

            const currentDirectory = path.dirname(realPath);

            if (contents.trim().endsWith('.yml')) {
                const referencedPath = path.join(currentDirectory, contents);

                Logger.verbose(`Loading actual file '${referencedPath}'`);

                if (fs.existsSync(referencedPath)) {
                    const referencedContents = fs.readFileSync(referencedPath, 'utf8');

                    return yaml.load(referencedContents) as {[key: string]: T};
                }

                // reject(`The file [${realPath}] referenced another file [${referencedPath}], which did not exist.`);

                return {};
            }

            return yaml.load(contents) as {[key: string]: T};
        }
        catch {
            return {};
        }
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
            await fs.writeFile(filepath, yaml.dump(data));
        }
        catch {
            return false;
        }

        return true;
    }

    public async update<T = unknown>(
        id: string,
        data: T,
        config: DataSourceConfig = {}
    ): Promise<boolean> {
        const currentData = await this.fetchAll<T>(config);

        if (Array.isArray(currentData)) {
            throw new TypeError('Yaml data stored as array, cannot update by id');
        }

        currentData[id] = data;

        return this.replace(currentData, config);
    }
}

export default YamlDataSource;
