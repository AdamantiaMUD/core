import DataSource, {DataPaths} from './data-source';
import JsonAreaDataSource from './json-area-data-source';
import JsonDataSource from './json-data-source';
import JsonDirectoryDataSource from './json-directory-data-source';
import YamlAreaDataSource from './yaml-area-data-source';
import YamlDataSource from './yaml-data-source';
import YamlDirectoryDataSource from './yaml-directory-data-source';

export class DataSourceFactory {
    private sources: Map<string, DataSource> = new Map();

    private readonly paths: DataPaths;

    public constructor(paths: DataPaths) {
        this.paths = paths;
    }

    public getDataSource(name: string): DataSource {
        if (this.sources.has(name)) {
            return this.sources.get(name);
        }

        let source = null;

        switch (name) {
            case 'JsonArea':
                source = new JsonAreaDataSource(this.paths);
                break;

            case 'Json':
                source = new JsonDataSource(this.paths);
                break;

            case 'JsonDirectory':
                source = new JsonDirectoryDataSource(this.paths);
                break;

            case 'YamlArea':
                source = new YamlAreaDataSource(this.paths);
                break;

            case 'Yaml':
                source = new YamlDataSource(this.paths);
                break;

            case 'YamlDirectory':
                source = new YamlDirectoryDataSource(this.paths);
                break;
        }

        if (source !== null) {
            this.sources.set(name, source);
        }

        return source;
    }
}

export default DataSourceFactory;
