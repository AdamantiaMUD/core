import fs from 'fs';
import path from 'path';

import Data from './util/data';
import EntityFactory from './entities/entity-factory';
import EntityLoaderRegistry from './data/entity-loader-registry';
import GameState from './game-state';
import Logger from './util/logger';
import {AreaDefinition, AreaManifest} from './locations/area';
import {ServerEventListenersDefinition} from './events/server-events';
import {DataPaths} from './data/sources/data-source';

export class BundleManager {
    private readonly areas: string[] = [];
    private readonly loaderRegistry: EntityLoaderRegistry;
    private readonly state: GameState;

    public constructor(state: GameState) {
        const bundlePath: string = state.config.get('bundlesPath', null);
        const dataPath: string = state.config.get('dataPath', null);
        const rootPath: string = state.config.get('rootPath', null);

        if (!bundlePath || !fs.existsSync(bundlePath)) {
            Logger.error(`Bundle path "${bundlePath}" is not valid`);
            throw new Error('Invalid bundle path');
        }

        if (!dataPath || !fs.existsSync(dataPath)) {
            Logger.error(`Data path "${dataPath}" is not valid`);
            throw new Error('Invalid data path');
        }

        if (!rootPath || !fs.existsSync(rootPath)) {
            Logger.error(`Root path "${rootPath}" is not valid`);
            throw new Error('Invalid root path');
        }

        const loaderPaths: DataPaths = {
            bundles: bundlePath,
            data: dataPath,
            root: rootPath,
        };

        this.loaderRegistry = new EntityLoaderRegistry(state.config.get('entityLoaders'), loaderPaths);
        this.state = state;
    }

    private isBundleEnabled(bundle: string, prefix: string = ''): boolean {
        return this.state.config.get('bundles', []).indexOf(`${prefix}${bundle}`) > -1;
    }

    private isValidBundle(bundle: string, bundlePath: string): boolean {
        return !(fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..');
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

        await this.loadServerEvents(bundle, bundlePath);
        await this.loadAreas(bundle);

        Logger.verbose(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- END`);
    }

    private async loadBundlesFromFolder(bundlesPath: string, prefix: string = ''): Promise<void> {
        const bundles = fs.readdirSync(bundlesPath);

        for (const bundle of bundles) {
            const bundlePath = path.join(bundlesPath, bundle);

            // only load bundles the user has configured to be loaded
            if (this.isValidBundle(bundle, bundlePath) && this.isBundleEnabled(bundle, prefix)) {
                await this.loadBundle(bundle, bundlePath);
            }
        }
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
            Logger.verbose('loader does not have data');

            return [];
        }

        Logger.verbose('loader has data');

        const entities = await loader.fetchAll();

        console.log(JSON.stringify(entities, null, 4));

        return entities.map(entity => {
            const ref = EntityFactory.createRef(areaName, entity.id);

            factory.setDefinition(ref, entity);

            return ref;
        });
    }

    private async loadServerEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'server-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.verbose('\tLOAD: Server Events...');

        const files = fs.readdirSync(uri);

        for (const eventsFile of files) {
            const eventsPath = path.join(uri, eventsFile);

            if (Data.isScriptFile(eventsPath, eventsFile)) {
                const eventsName = path.basename(eventsFile, path.extname(eventsFile));

                Logger.verbose(`\t\t\tLOAD: SERVER-EVENTS ${eventsName}...`);

                const eventImport = await import(eventsPath);
                const loader: ServerEventListenersDefinition = eventImport.default;

                const {listeners} = loader;

                for (const [eventName, listener] of Object.entries(listeners)) {
                    this.state.serverEventManager.add(eventName, listener(this.state));
                }
            }
        }

        Logger.verbose('\tENDLOAD: Server Events...');
    }

    public async loadBundles(): Promise<void> {
        Logger.verbose('LOAD: BUNDLES -- START');

        const coreBundlesDir = path.join(__dirname, '..', 'core-bundles');
        const bundlePath: string = this.state.config.get('bundlesPath');

        await this.loadBundlesFromFolder(coreBundlesDir, 'core.');
        await this.loadBundlesFromFolder(bundlePath);

        Logger.verbose('LOAD: BUNDLES -- END');
    }
}

export default BundleManager;
