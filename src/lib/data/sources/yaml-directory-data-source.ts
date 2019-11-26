import fs from 'fs';
import path from 'path';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';
import YamlDataSource from './yaml-data-source';

/**
 * Data source when you have a directory of yaml files and each entity is stored in
 * its own yaml file, e.g.,
 *
 *   foo/
 *     a.yml
 *     b.yml
 *     c.yml
 *
 * Config:
 *   path: string: relative path to directory containing .yml files from project root
 */
class YamlDirectoryDataSource extends FileDataSource {
    public hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const filepath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(filepath));
    }

    public fetchAll(config: DataSourceConfig = {}): Promise<unknown> {
        const dirPath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlDirectoryDataSource`);
        }

        return new Promise((resolve, reject) => {
            const data = {};

            fs.readdir(dirPath, async (err, files) => {
                if (err) {
                    reject(err);

                    return;
                }

                for (const file of files) {
                    if (path.extname(file) === '.yml') {
                        const id = path.basename(file, '.yml');

                        // eslint-disable-next-line no-await-in-loop
                        data[id] = await this.fetch(config, id);
                    }
                }

                resolve(data);
            });
        });
    }

    public fetch(config: DataSourceConfig = {}, id: string): Promise<unknown> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlDirectoryDataSource`);
        }

        const source = new YamlDataSource(this.appConfig);

        return source.fetchAll({path: path.join(dirPath, `${id}.yml`)});
    }

    public replace(
        /* eslint-disable @typescript-eslint/no-unused-vars */
        config: DataSourceConfig = {},
        data: unknown
        /* eslint-enable @typescript-eslint/no-unused-vars */
    ): Promise<undefined> {
        return Promise.reject(new Error('You cannot replace an entire directory'));
    }

    public update(config: DataSourceConfig = {}, id: string, data: unknown): Promise<undefined> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlDirectoryDataSource`);
        }

        const source = new YamlDataSource(this.appConfig);

        return source.replace({path: path.join(dirPath, `${id}.yml`)}, data);
    }
}

export default YamlDirectoryDataSource;
