import fs from 'fs';
import path from 'path';

import Config from './util/config';
import EntityFactory from './entities/entity-factory';
import EntityLoaderRegistry from './data/entity-loader-registry';
import Logger from './util/logger';
import {AreaDefinition, AreaManifest} from './locations/area';

export class BundleManager {
    private readonly areas: string[] = [];
    private readonly bundlePath: string;
    private readonly config: Config;
    private readonly loaderRegistry: EntityLoaderRegistry;

    public constructor(bundlePath: string, config: Config) {
        if (!bundlePath || !fs.existsSync(bundlePath)) {
            Logger.error(`Bundle path "${bundlePath}" is not valid`);
            throw new Error('Invalid bundle path');
        }

        const rootPath = config.get('rootPath', null);

        if (!rootPath || !fs.existsSync(rootPath)) {
            throw new Error('Invalid root path');
        }

        this.bundlePath = bundlePath;
        this.config = config;
        this.loaderRegistry = new EntityLoaderRegistry(config.get('entityLoaders'), rootPath);
    }

    private isValidBundle(bundle: string, bundlePath: string): boolean {
        if (fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..') {
            return false;
        }

        return this.config.get('bundles', []).indexOf(bundle) > -1;
    }

    private async loadArea(bundle: string, areaName: string, manifest: AreaManifest): Promise<void> {
        Logger.verbose(`\t\tLOAD: AREA \`${areaName}\` -- START`);

        const definition: AreaDefinition = {
            bundle: bundle,
            manifest: manifest,
            rooms: [],
        };

        Logger.verbose(`\t\t\tAREA \`${areaName}\`: Rooms...`);
        definition.rooms = await this.loadEntities(bundle, areaName, 'rooms', null);

        Logger.verbose(`\t\tLOAD: AREA \`${areaName}\` -- END`);
    }

    private async loadAreas(bundle: string): Promise<void> {
        Logger.verbose('LOAD: AREAS -- START');

        const loader = this.loaderRegistry.get('areas');

        loader.setBundle(bundle);

        if (!await loader.hasData()) {
            return;
        }

        const areas: {[key: string]: AreaManifest} = await loader.fetchAll();

        for (const [name, manifest] of Object.entries(areas)) {
            this.areas.push(name);

            await this.loadArea(bundle, name, manifest);
        }

        Logger.verbose('LOAD: AREAS -- END');
    }

    private async loadBundle(bundle: string, bundlePath: string): Promise<void> {
        Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- START`);

        await this.loadAreas(bundle);

        Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- END`);
    }

    private async loadEntities<T extends EntityFactory<any, any>>(
        bundle: string,
        areaName: string,
        type: string,
        factory: T
    ): Promise<string[]> {
        const loader = this.loaderRegistry.get(type);

        loader.setBundle(bundle);
        loader.setArea(areaName);

        if (!await loader.hasData()) {
            return [];
        }

        const entities = await loader.fetchAll();

        return entities.map(entity => {
            const ref = EntityFactory.createRef(areaName, entity.id);

            factory.setDefinition(ref, entity);

            return ref;
        });
    }

    public async loadBundles(): Promise<void> {
        Logger.verbose('LOAD: BUNDLES -- START');

        const bundles = fs.readdirSync(this.bundlePath);

        for (const bundle of bundles) {
            const bundlePath = this.bundlePath + bundle;

            // only load bundles the user has configured to be loaded
            if (this.isValidBundle(bundle, bundlePath)) {
                await this.loadBundle(bundle, bundlePath);
            }
        }

        Logger.verbose('LOAD: BUNDLES -- END');
    }
}

export default BundleManager;
