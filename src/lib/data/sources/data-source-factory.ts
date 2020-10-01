import JsonAreaDataSource from './json-area-data-source';
import JsonDataSource from './json-data-source';
import JsonDirectoryDataSource from './json-directory-data-source';
import YamlAreaDataSource from './yaml-area-data-source';
import YamlDataSource from './yaml-data-source';
import YamlDirectoryDataSource from './yaml-directory-data-source';

import type Config from '../../util/config';
import type DataSource from './data-source';

export class DataSourceFactory {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _config: Config;
    private readonly _sources: Map<string, DataSource> = new Map<string, DataSource>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(config: Config) {
        this._config = config;
    }

    public getDataSource(name: string): DataSource | null {
        if (this._sources.has(name)) {
            return this._sources.get(name)!;
        }

        let source: DataSource | null = null;

        switch (name) {
            case 'JsonArea':
                source = new JsonAreaDataSource(this._config);
                break;

            case 'Json':
                source = new JsonDataSource(this._config);
                break;

            case 'JsonDirectory':
                source = new JsonDirectoryDataSource(this._config);
                break;

            case 'YamlArea':
                source = new YamlAreaDataSource(this._config);
                break;

            case 'Yaml':
                source = new YamlDataSource(this._config);
                break;

            case 'YamlDirectory':
                source = new YamlDirectoryDataSource(this._config);
                break;

            /* no default */
        }

        if (source !== null) {
            this._sources.set(name, source);
        }

        return source;
    }
}

export default DataSourceFactory;
