import DataSourceFactory from './sources/data-source-factory';
import EntityLoader from './entity-loader';

import type Config from '../util/config';
import type DataSource from './sources/data-source';

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
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _config: Config;
    private readonly _dataSourceFactory: DataSourceFactory;
    private readonly _loaders: Map<string, EntityLoader> = new Map<string, EntityLoader>();
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(loaderConfig: EntityLoaderDefinitions, config: Config) {
        this._config = config;
        this._dataSourceFactory = new DataSourceFactory(config);

        this._initLoaders(loaderConfig);
    }

    private _getDataSource(entityName: string, settings: EntityLoaderDefinition): DataSource {
        const source = this._dataSourceFactory.getDataSource(settings.source);

        if (source === null) {
            throw new Error(`Invalid source [${settings.source}] for entity [${entityName}]`);
        }

        return source;
    }

    private _initLoaders(config: EntityLoaderDefinitions): void {
        for (const [name, settings] of Object.entries(config)) {
            this._validateLoader(name, settings);

            const source = this._getDataSource(name, settings);
            const sourceConfig = settings.config ?? {};

            this._loaders.set(name, new EntityLoader(source, sourceConfig));
        }
    }

    private _validateLoader(name: string, settings: EntityLoaderDefinition): void {
        if (!Object.prototype.hasOwnProperty.call(settings, 'source')) {
            throw new Error(`EntityLoader [${name}] does not specify a 'source'`);
        }

        if (typeof settings.source !== 'string') {
            throw new TypeError(`EntityLoader [${name}] has an invalid 'source'`);
        }
    }

    public get(name: string): EntityLoader | undefined {
        return this._loaders.get(name);
    }
}

export default EntityLoaderRegistry;
