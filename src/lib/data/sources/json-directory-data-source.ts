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
    public hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public fetchAll(config: DataSourceConfig = {}): Promise<any> {
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

    public fetch(config: DataSourceConfig = {}, id: string): Promise<any> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        return source.fetchAll({path: `${dirPath}/${id}.json`});
    }

    public replace(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        config: DataSourceConfig = {},
        data: any
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): Promise<undefined> {
        return Promise.reject(new Error('You cannot replace an entire directory'));
    }

    public update(config: DataSourceConfig = {}, id: string, data: any): Promise<undefined> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonDirectoryDataSource`);
        }
        const source = new JsonDataSource(this.appConfig);

        return source.replace({path: `${dirPath}/${id}.json`}, data);
    }
}

export default JsonDirectoryDataSource;
