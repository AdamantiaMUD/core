import fs from 'fs';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';
import JsonDataSource from './json-data-source';
import Logger from '../../util/logger';

/**
 * Data source for areas stored in json. Looks for a directory structure like:
 *
 *   path/
 *     area-one/
 *       manifest.json
 *     area-two/
 *       manifest.json
 *
 * Config:
 *   path: string: relative path to directory containing area folders
 */
class JsonAreaDataSource extends FileDataSource {
    public hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const dirPath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(dirPath));
    }

    public fetchAll(config: DataSourceConfig = {}): Promise<any> {
        const dirPath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonAreaDataSource`);
        }

        return new Promise((resolve, reject) => {
            const data = {};

            fs.readdir(fs.realpathSync(dirPath), {withFileTypes: true}, async (err, files) => {
                if (err) {
                    reject(err);

                    return;
                }

                for (const file of files) {
                    const manifestPath = [dirPath, file.name, 'manifest.json'].join('/');

                    if (file.isDirectory() && fs.existsSync(manifestPath)) {
                        /* eslint-disable-next-line no-await-in-loop */
                        data[file.name] = await this.fetch(config, file.name);
                    }
                }

                resolve(data);
            });
        });
    }

    public fetch(config: DataSourceConfig = {}, id: string): Promise<any> {
        const dirPath = this.resolvePath(config);

        if (!fs.existsSync(dirPath)) {
            throw new Error(`Invalid path [${dirPath}] specified for JsonAreaDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        return source.fetchAll({path: `${dirPath}/${id}/manifest.json`});
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
            throw new Error(`Invalid path [${dirPath}] specified for JsonAreaDataSource`);
        }

        const source = new JsonDataSource(this.appConfig);

        return source.replace({path: `${dirPath}/${id}/manifest.json`}, data);
    }
}

export default JsonAreaDataSource;
