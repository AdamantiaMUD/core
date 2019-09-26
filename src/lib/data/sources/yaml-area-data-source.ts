import fs from 'fs';

import DataSourceConfig from './data-source-config';
import FileDataSource from './file-data-source';
import YamlDataSource from './yaml-data-source';

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
class YamlAreaDataSource extends FileDataSource {
    public hasData(config: DataSourceConfig = {}): Promise<boolean> {
        const dirPath = this.resolvePath(config);

        return Promise.resolve(fs.existsSync(dirPath));
    }

    public fetchAll(config: DataSourceConfig = {}): Promise<any> {
        const dirPath = this.resolvePath(config);

        if (!this.hasData(config)) {
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        return new Promise((resolve, reject) => {
            const data = {};

            fs.readdir(fs.realpathSync(dirPath), {withFileTypes: true}, async (err, files) => {
                if (err) {
                    reject(err);

                    return;
                }

                for (const file of files) {
                    const manifestPath = [dirPath, file.name, 'manifest.yml'].join('/');

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
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        const source = new YamlDataSource(this.paths);

        return source.fetchAll({path: `${dirPath}/${id}/manifest.yml`});
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
            throw new Error(`Invalid path [${dirPath}] specified for YamlAreaDataSource`);
        }

        const source = new YamlDataSource(this.paths);

        return source.replace({path: `${dirPath}/${id}/manifest.yml`}, data);
    }
}

export default YamlAreaDataSource;
