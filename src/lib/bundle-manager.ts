import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

import AttributeFormula from './attributes/attribute-formula';
import BehaviorManager from './behaviors/behavior-manager';
import Command from './commands/command';
import {QuestDefinition} from './quests/quest';
import QuestGoal from './quests/quest-goal';
import QuestReward from './quests/quest-reward';
import Data from './util/data';
import EntityFactory from './entities/entity-factory';
import GameState from './game-state';
import Helpfile, {HelpfileOptions} from './help/helpfile';
import Logger from './util/logger';
import {AreaDefinition, AreaManifest} from './locations/area';
import {InputEventListenerDefinition} from './events/input-events';
import {PlayerEventListenerFactory} from './events/player-events';
import {ServerEventListenersDefinition} from './events/server-events';
import {
    BehaviorDefinition,
    BehaviorEventListenerDefinition
} from './behaviors/behavior';

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

    private getAreaScriptPath(bundlePath: string, areaName: string): string {
        return path.join(bundlePath, 'areas', areaName, 'scripts');
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

    private async loadArea(
        bundle: string,
        bundlePath: string,
        areaName: string,
        manifest: AreaManifest
    ): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- START`);

        const definition: AreaDefinition = {
            bundle: bundle,
            manifest: manifest,
            npcs: [],
            quests: [],
            rooms: [],
        };

        Logger.verbose(`LOAD: Area \`${areaName}\`: Quests...`);
        definition.quests = await this.loadQuests(bundle, areaName);

        Logger.verbose(`LOAD: Area \`${areaName}\`: Items...`);
        definition.rooms = await this.loadEntities(
            bundle,
            bundlePath,
            areaName,
            'items',
            this.state.itemFactory
        );

        Logger.verbose(`LOAD: Area \`${areaName}\`: NPCs...`);
        definition.npcs = await this.loadEntities(
            bundle,
            bundlePath,
            areaName,
            'npcs',
            this.state.mobFactory
        );

        Logger.verbose(`LOAD: Area \`${areaName}\`: Rooms...`);
        definition.rooms = await this.loadEntities(
            bundle,
            bundlePath,
            areaName,
            'rooms',
            this.state.roomFactory
        );

        this.state.areaFactory.setDefinition(areaName, definition);

        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- END`);
    }

    private async loadAreas(bundle: string, bundlePath: string): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Areas -- START`);

        const loader = this.state.entityLoaderRegistry.get('areas');

        loader.setBundle(bundle);

        if (!await loader.hasData()) {
            return;
        }

        const areas: {[key: string]: AreaManifest} = await loader.fetchAll();

        for (const [name, manifest] of Object.entries(areas)) {
            this.areas.push(name);

            await this.loadArea(bundle, bundlePath, name, manifest);
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

    private async loadBehaviors(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'behaviors');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Behaviors -- START`);

        const loadEntityBehaviors = async (
            type: string,
            manager: BehaviorManager,
            state: GameState
        ): Promise<void> => {
            const typeDir = path.join(uri, type);

            if (!fs.existsSync(typeDir)) {
                return;
            }

            Logger.verbose(`LOAD: ${bundle} - Behaviors -> ${type}`);
            const files = fs.readdirSync(typeDir);

            for (const behaviorFile of files) {
                const behaviorPath = path.join(typeDir, behaviorFile);

                if (Data.isScriptFile(behaviorPath, behaviorFile)) {
                    const behaviorName = path.basename(behaviorFile, path.extname(behaviorFile));

                    Logger.verbose(`LOAD: ${bundle} - Behaviors -> ${type} -> ${behaviorName}`);

                    const behaviorImport = await import(behaviorPath);
                    const loader: BehaviorEventListenerDefinition = behaviorImport.default;

                    const {listeners} = loader;

                    for (const [eventName, listener] of Object.entries(listeners)) {
                        manager.addListener(behaviorName, eventName, listener(state));
                    }
                }
            }
        };

        await loadEntityBehaviors('area', this.state.areaBehaviorManager, this.state);
        await loadEntityBehaviors('npc', this.state.mobBehaviorManager, this.state);
        await loadEntityBehaviors('item', this.state.itemBehaviorManager, this.state);
        await loadEntityBehaviors('room', this.state.roomBehaviorManager, this.state);

        Logger.info(`LOAD: ${bundle} - Behaviors -- END`);
    }

    private async loadBundle(bundle: string, bundlePath: string): Promise<void> {
        Logger.info(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- START`);

        await this.loadQuestGoals(bundle, bundlePath);
        await this.loadQuestRewards(bundle, bundlePath);
        await this.loadAttributes(bundle, bundlePath);
        await this.loadBehaviors(bundle, bundlePath);
        // await this.loadChannels(bundle, bundlePath);
        await this.loadCommands(bundle, bundlePath);
        await this.loadEffects(bundle, bundlePath);
        await this.loadInputEvents(bundle, bundlePath);
        await this.loadServerEvents(bundle, bundlePath);
        await this.loadPlayerEvents(bundle, bundlePath);
        // await this.loadSkills(bundle, bundlePath);
        await this.loadHelp(bundle, bundlePath);

        await this.loadAreas(bundle, bundlePath);

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
        const files = await fs.readdir(uri);

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

    private async loadEffects(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'effects');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Effects -- START`);
        const files = fs.readdirSync(uri);

        for (const effectFile of files) {
            const effectPath = path.join(uri, effectFile);

            if (Data.isScriptFile(effectPath, effectFile)) {
                const effectName = path.basename(effectFile, path.extname(effectFile));

                const effectImport = await import(effectPath);
                const loader = effectImport.default;

                Logger.verbose(`LOAD: ${bundle} - Effects -> ${effectName}`);

                this.state
                    .effectFactory
                    .add(effectName, loader, this.state);
            }
        }

        Logger.info(`LOAD: ${bundle} - Effects -- END`);
    }

    private async loadEntities<T extends EntityFactory<any, any>>(
        bundle: string,
        bundlePath: string,
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
        const scriptPath = this.getAreaScriptPath(bundlePath, areaName);

        return entities.map(entity => {
            const ref = EntityFactory.createRef(areaName, entity.id);

            factory.setDefinition(ref, entity);

            if (entity.script) {
                const scriptUri = path.join(scriptPath, type, entity.script);

                Logger.verbose(`Loading entity script - [${ref}] -> ${entity.script}`);

                try {
                    this.loadEntityScript(factory, ref, scriptUri);
                }
                catch (e) {
                    Logger.warn(`Missing entity script - [${ref}] -> ${entity.script}`);
                }
            }

            return ref;
        });
    }

    private async loadEntityScript(
        factory: EntityFactory<any, any>,
        ref: string,
        scriptPath: string
    ): Promise<void> {
        const scriptImport = await import(scriptPath);
        const loader: BehaviorDefinition = scriptImport.default;

        const {listeners} = loader;

        Logger.info(`LOAD: ${ref} - Script Listeners -- START`);

        for (const [eventName, listener] of Object.entries(listeners)) {
            Logger.verbose(`LOAD: ${ref} - Script Listeners -> ${eventName}`);

            factory.addScriptListener(ref, eventName, listener(this.state));
        }

        Logger.info(`LOAD: ${ref} - Script Listeners -- END`);
    }

    private async loadHelp(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'help');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Help -- START`);

        const files = await fs.readdir(uri);

        for (const helpFile of files) {
            const helpName = path.basename(helpFile, path.extname(helpFile));
            Logger.verbose(`LOAD: ${bundle} - Help -> ${helpName}`);

            const helpPath = path.join(uri, helpFile);

            const contents = await fs.readFile(helpPath, 'utf8');
            const helpData: HelpfileOptions = yaml.load(contents);

            const hfile = new Helpfile(bundle, helpName, helpData);

            this.state.helpManager.add(hfile);
        }

        Logger.info(`LOAD: ${bundle} - Help -- END`);
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

    private async loadQuestGoals(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'quests', 'goals');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Quest Goals -- START`);

        const files = fs.readdirSync(uri);

        for (const goalFile of files) {
            const goalPath = path.join(uri, goalFile);

            if (Data.isScriptFile(goalPath, goalFile)) {
                const goalName = path.basename(goalFile, path.extname(goalFile));

                const goalImport = await import(goalPath);
                const loader: typeof QuestGoal = goalImport.default;

                Logger.verbose(`LOAD: ${bundle} - Quest Goals -> ${goalName}`);

                this.state.questGoalManager.set(goalName, loader);
            }
        }

        Logger.info(`LOAD: ${bundle} - Quest Goals -- END`);
    }

    private async loadQuestRewards(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'quests', 'rewards');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Quest Rewards -- START`);
        const files = fs.readdirSync(uri);

        for (const rewardFile of files) {
            const rewardPath = path.join(uri, rewardFile);

            if (Data.isScriptFile(rewardPath, rewardFile)) {
                const rewardName = path.basename(rewardFile, path.extname(rewardFile));

                const rewardImport = await import(rewardPath);
                const loader: QuestReward = rewardImport.default;

                Logger.verbose(`LOAD: ${bundle} - Quest Rewards -> ${rewardName}`);

                this.state.questRewardManager.set(rewardName, loader);
            }
        }

        Logger.info(`LOAD: ${bundle} - Quest Rewards -- END`);
    }

    private async loadQuests(bundle: string, areaName: string): Promise<string[]> {
        const loader = this.state.entityLoaderRegistry.get('quests');

        loader.setBundle(bundle);
        loader.setArea(areaName);

        let quests: QuestDefinition[] = [];

        try {
            quests = await loader.fetchAll();
        }
        catch (err) {
            // no-op
        }

        return quests.map(quest => {
            const ref = `${areaName}:${quest.id}`;

            Logger.verbose(`LOAD: ${bundle} - Areas -> ${areaName} -> Quests -> ${ref}`);

            this.state.questFactory.add(ref, areaName, quest.id, quest);

            return ref;
        });
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
