import DataSource from './sources/data-source';
import DataSourceFactory from './sources/data-source-factory';
import EntityLoader from './entity-loader';
import Config from '../util/config';

export interface EntityLoaderDefinition {
    source: string;
    config?: {[key: string]: unknown};
}

export interface EntityLoaderDefinitions {
    [key: string]: EntityLoaderDefinition;
}

/**
 * Holds instances of configured EntityLoaders
 */
export class EntityLoaderRegistry {
    private readonly config: Config;

    private readonly dataSourceFactory: DataSourceFactory;
    private readonly loaders: Map<string, EntityLoader> = new Map();

    public constructor(loaderConfig: EntityLoaderDefinitions, config: Config) {
        this.config = config;
        this.dataSourceFactory = new DataSourceFactory(config);

        this.initLoaders(loaderConfig);
    }

    // noinspection JSMethodCanBeStatic
    private getDataSource(entityName: string, settings: EntityLoaderDefinition): DataSource {
        const source = this.dataSourceFactory.getDataSource(settings.source);

        if (source === null) {
            throw new Error(`Invalid source [${settings.source}] for entity [${entityName}]`);
        }

        return source;
    }

    private initLoaders(config: EntityLoaderDefinitions): void {
        for (const [name, settings] of Object.entries(config)) {
            this.validateLoader(name, settings);

            const source = this.getDataSource(name, settings);
            const sourceConfig = settings.config || {};

            this.loaders.set(name, new EntityLoader(source, sourceConfig));
        }
    }

    // noinspection JSMethodCanBeStatic
    private validateLoader(name: string, settings: EntityLoaderDefinition): void {
        if (!Object.prototype.hasOwnProperty.call(settings, 'source')) {
            throw new Error(`EntityLoader [${name}] does not specify a 'source'`);
        }

        if (typeof settings.source !== 'string') {
            throw new TypeError(`EntityLoader [${name}] has an invalid 'source'`);
        }
    }

    public get(name: string): EntityLoader {
        return this.loaders.get(name);
    }
}

export default EntityLoaderRegistry;
