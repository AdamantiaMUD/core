import Config from '../../util/config';
import DataSource from './data-source';
import JsonAreaDataSource from './json-area-data-source';
import JsonDataSource from './json-data-source';
import JsonDirectoryDataSource from './json-directory-data-source';
import YamlAreaDataSource from './yaml-area-data-source';
import YamlDataSource from './yaml-data-source';
import YamlDirectoryDataSource from './yaml-directory-data-source';

export class DataSourceFactory {
    private sources: Map<string, DataSource> = new Map();

    private readonly config: Config;

    public constructor(config: Config) {
        this.config = config;
    }

    public getDataSource(name: string): DataSource {
        if (this.sources.has(name)) {
            return this.sources.get(name);
        }

        let source = null;

        switch (name) {
            case 'JsonArea':
                source = new JsonAreaDataSource(this.config);
                break;

            case 'Json':
                source = new JsonDataSource(this.config);
                break;

            case 'JsonDirectory':
                source = new JsonDirectoryDataSource(this.config);
                break;

            case 'YamlArea':
                source = new YamlAreaDataSource(this.config);
                break;

            case 'Yaml':
                source = new YamlDataSource(this.config);
                break;

            case 'YamlDirectory':
                source = new YamlDirectoryDataSource(this.config);
                break;
        }

        if (source !== null) {
            this.sources.set(name, source);
        }

        return source;
    }
}

export default DataSourceFactory;
