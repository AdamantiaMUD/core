import fs from 'fs';
import yaml from 'js-yaml';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';

/**
 * Data source when you have all entities in a single yaml file
 *
 * Config:
 *   path: string: relative path to .yml file from project root
 */
class YamlDataSource extends FileDataSource {
    public hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public fetchAll(config: DataSourceConfig = {}): Promise<any> {
        const filepath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${filepath}] for YamlDataSource`);
        }

        return new Promise((resolve, reject) => {
            try {
                const realPath = fs.realpathSync(filepath);
                const contents = fs.readFileSync(realPath, 'utf8');

                resolve(yaml.load(contents));
            }
            catch (err) {
                reject(err);
            }
        });
    }

    public async fetch(config: DataSourceConfig = {}, id: string): Promise<any> {
        const data = await this.fetchAll(config);

        if (!data.hasOwnProperty(id)) {
            throw new ReferenceError(`Record with id [${id}] not found.`);
        }

        return data[id];
    }

    public replace(config: DataSourceConfig = {}, data: any): Promise<undefined> {
        const filepath = this.resolvePath(config);

        return new Promise((resolve, reject) => {
            fs.writeFile(filepath, yaml.dump(data), err => {
                if (err) {
                    reject(err);

                    return;
                }

                resolve();
            });
        });
    }

    public async update(
        config: DataSourceConfig = {},
        id: string,
        data: any
    ): Promise<undefined> {
        const currentData = await this.fetchAll(config);

        if (Array.isArray(currentData)) {
            throw new TypeError('Yaml data stored as array, cannot update by id');
        }

        currentData[id] = data;

        return this.replace(config, currentData);
    }
}

export default YamlDataSource;
