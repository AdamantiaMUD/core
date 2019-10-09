import fs from 'fs';
import path from 'path';
import Command from './commands/command';

import AttributeFormula from './attributes/attribute-formula';
import Data from './util/data';
import EntityFactory from './entities/entity-factory';
import GameState from './game-state';
import Logger from './util/logger';
import {AreaDefinition, AreaManifest} from './locations/area';
import {InputEventListenerDefinition} from './events/input-events';
import {PlayerEventListenerFactory} from './events/player-events';
import {ServerEventListenersDefinition} from './events/server-events';

export class BundleManager {
    private readonly areas: string[] = [];
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

        this.state = state;
    }

    private async createCommand(uri: string, name: string, bundle: string): Promise<Command> {
        const commandImport = await import(uri);
        const loader = commandImport.default;

        loader.command = loader.command(this.state);

        return new Command(bundle, name, loader, uri);
    }

    private hydrateAreas(): void {
        for (const areaRef of this.areas) {
            const area = this.state.areaFactory.create(areaRef);

            try {
                area.hydrate(this.state);
            }
            catch (err) {
                Logger.error(err.message);

                throw new Error();
            }

            this.state.areaManager.addArea(area);
        }
    }

    private isBundleEnabled(bundle: string, prefix: string = ''): boolean {
        return this.state.config.get('bundles', []).indexOf(`${prefix}${bundle}`) > -1;
    }

    private isValidBundle(bundle: string, bundlePath: string): boolean {
        return !(fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..');
    }

    private async loadArea(bundle: string, areaName: string, manifest: AreaManifest): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- START`);

        const definition: AreaDefinition = {
            bundle: bundle,
            manifest: manifest,
            rooms: [],
        };

        Logger.verbose(`LOAD: Area \`${areaName}\`: Items...`);
        definition.rooms = await this.loadEntities(
            bundle,
            areaName,
            'items',
            this.state.itemFactory
        );

        Logger.verbose(`LOAD: Area \`${areaName}\`: Rooms...`);
        definition.rooms = await this.loadEntities(
            bundle,
            areaName,
            'rooms',
            this.state.roomFactory
        );

        this.state.areaFactory.setDefinition(areaName, definition);

        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- END`);
    }

    private async loadAreas(bundle: string): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Areas -- START`);

        const loader = this.state.entityLoaderRegistry.get('areas');

        loader.setBundle(bundle);

        if (!await loader.hasData()) {
            return;
        }

        const areas: {[key: string]: AreaManifest} = await loader.fetchAll();

        for (const [name, manifest] of Object.entries(areas)) {
            this.areas.push(name);

            await this.loadArea(bundle, name, manifest);
        }

        Logger.info(`LOAD: ${bundle} - Areas -- END`);
    }

    private async loadAttributes(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'attributes.js');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Attributes -- START`);

        const attributeImport = await import(uri);
        const attributes = attributeImport.default;

        const error = `Attributes file [${uri}] from bundle [${bundle}]`;

        if (!Array.isArray(attributes)) {
            Logger.error(`${error} does not define an array of attributes`);

            return;
        }

        for (const attribute of attributes) {
            if (typeof attribute !== 'object') {
                Logger.error(`${error} not an object`);
            }
            else if (!('name' in attribute) || !('base' in attribute)) {
                Logger.error(`${error} does not include required properties name and base`);
            }
            else {
                let formula = null;

                if (attribute.formula) {
                    formula = new AttributeFormula(
                        attribute.formula.requires,
                        attribute.formula.fn
                    );
                }

                Logger.verbose(`LOAD: ${bundle} - Attributes -> ${attribute.name}`);

                this.state
                    .attributeFactory
                    .add(attribute.name, attribute.base, formula, attribute.metadata);
            }
        }

        Logger.info(`LOAD: ${bundle} - Attributes -- END`);
    }

    private async loadBundle(bundle: string, bundlePath: string): Promise<void> {
        Logger.info(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- START`);

        // await this.loadQuestGoals(bundle, bundlePath);
        // await this.loadQuestRewards(bundle, bundlePath);
        await this.loadAttributes(bundle, bundlePath);
        // await this.loadBehaviors(bundle, bundlePath);
        // await this.loadChannels(bundle, bundlePath);
        await this.loadCommands(bundle, bundlePath);
        // await this.loadEffects(bundle, bundlePath);
        await this.loadInputEvents(bundle, bundlePath);
        await this.loadServerEvents(bundle, bundlePath);
        await this.loadPlayerEvents(bundle, bundlePath);
        // await this.loadSkills(bundle, bundlePath);

        await this.loadAreas(bundle);

        Logger.info(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- END`);
    }

    private async loadBundlesFromFolder(bundlesPath: string, prefix: string = ''): Promise<void> {
        const bundles = fs.readdirSync(bundlesPath);

        for (const bundle of bundles) {
            const bundlePath = path.join(bundlesPath, bundle);

            // only load bundles the user has configured to be loaded
            if (this.isValidBundle(bundle, bundlePath) && this.isBundleEnabled(bundle, prefix)) {
                await this.loadBundle(`${prefix}${bundle}`, bundlePath);
            }
        }
    }

    private async loadCommands(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'commands');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Commands -- START`);
        const files = fs.readdirSync(uri);

        for (const commandFile of files) {
            const commandPath = path.join(uri, commandFile);

            if (Data.isScriptFile(commandPath, commandFile)) {
                const commandName = path.basename(commandFile, path.extname(commandFile));

                Logger.verbose(`LOAD: ${bundle} - Commands -> ${commandName}`);

                const command = await this.createCommand(commandPath, commandName, bundle);

                this.state.commandManager.add(command);
            }
        }

        Logger.info(`LOAD: ${bundle} - Commands -- END`);
    }

    private async loadEntities<T extends EntityFactory<any, any>>(
        bundle: string,
        areaName: string,
        type: string,
        factory: T
    ): Promise<string[]> {
        const loader = this.state.entityLoaderRegistry.get(type);

        if (loader === null) {
            Logger.warn(`Could not find entity loader for type '${type}'`);

            return Promise.resolve([]);
        }

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

    private async loadInputEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'input-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Input Events -- START`);
        const files = fs.readdirSync(uri);

        for (const eventFile of files) {
            const eventPath = path.join(uri, eventFile);

            if (Data.isScriptFile(eventPath, eventFile)) {
                const eventName = path.basename(eventFile, path.extname(eventFile));

                Logger.verbose(`LOAD: ${bundle} - Input Events -> ${eventName}`);

                const eventImport = await import(eventPath);
                const loader: InputEventListenerDefinition = eventImport.default;

                if (typeof loader.event !== 'function') {
                    /* eslint-disable-next-line max-len */
                    throw new Error(`Bundle ${bundle} has an invalid input event '${eventName}'. Expected a function, got: ${typeof loader.event}`);
                }

                this.state.inputEventManager.add(eventName, loader.event(this.state));
            }
        }

        Logger.info(`LOAD: ${bundle} - Input Events -- END`);
    }

    private async loadPlayerEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'player-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Player Events -- START`);

        const files = fs.readdirSync(uri);

        for (const eventsFile of files) {
            const eventsPath = path.join(uri, eventsFile);

            if (Data.isScriptFile(eventsPath, eventsFile)) {
                const eventName = path.basename(eventsFile, path.extname(eventsFile));

                Logger.verbose(`LOAD: ${bundle} - Player Events -> ${eventName}`);

                const eventImport = await import(eventsPath);
                const event: PlayerEventListenerFactory = eventImport.default;

                this.state.playerManager.addListener(event.name, event.listener(this.state));
            }
        }

        Logger.info(`LOAD: ${bundle} - Player Events -- END`);
    }

    private async loadServerEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'server-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Server Events -- START`);

        const files = fs.readdirSync(uri);

        for (const eventsFile of files) {
            const eventsPath = path.join(uri, eventsFile);

            if (Data.isScriptFile(eventsPath, eventsFile)) {
                const eventsName = path.basename(eventsFile, path.extname(eventsFile));

                Logger.verbose(`LOAD: ${bundle} - Server Events -> ${eventsName}`);

                const eventImport = await import(eventsPath);
                const loader: ServerEventListenersDefinition = eventImport.default;

                const {listeners} = loader;

                for (const [eventName, listener] of Object.entries(listeners)) {
                    this.state.serverEventManager.add(eventName, listener(this.state));
                }
            }
        }

        Logger.info(`LOAD: ${bundle} - Server Events -- END`);
    }

    public async loadBundles(): Promise<void> {
        Logger.verbose('LOAD: BUNDLES -- START');

        const coreBundlesDir = path.join(__dirname, '..', 'core-bundles');
        const bundlePath: string = this.state.config.get('bundlesPath');

        await this.loadBundlesFromFolder(coreBundlesDir, 'core.');
        await this.loadBundlesFromFolder(bundlePath);

        Logger.verbose('LOAD: BUNDLES -- END');

        /*
         * Distribution is done after all areas are loaded in case items in one
         * area depend on another area.
         */
        this.hydrateAreas();
    }
}

export default BundleManager;
