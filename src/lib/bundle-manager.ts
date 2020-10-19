/* eslint-disable import/max-dependencies, no-await-in-loop */
/* eslint-disable-next-line id-length */
import fs from 'fs-extra';
import path from 'path';
import yaml from 'js-yaml';

import Command from './commands/command';
import Data from './util/data';
import EntityFactory from './entities/entity-factory';
import Helpfile from './help/helpfile';
import Logger, {logAndRethrow} from './common/logger';
import {cast, hasValue} from './util/functions';

import type AreaDefinition from './locations/area-definition';
import type AreaManifest from './locations/area-manifest';
import type BehaviorManager from './behaviors/behavior-manager';
import type CommandDefinition from './commands/command-definition';
import type GameEntity from './entities/game-entity';
import type GameEntityDefinition from './entities/game-entity-definition';
import type GameStateData from './game-state-data';
import type HelpfileOptions from './help/helpfile-options';
import type QuestDefinition from './quests/quest-definition';
import type ScriptableEntity from './entities/scriptable-entity';
import type ScriptableEntityDefinition from './entities/scriptable-entity-definition';
import type {
    AttributeModule,
    BehaviorModule,
    CharacterClassModule,
    CommandModule,
    EffectModule,
    EntityScriptModule,
    InputEventModule,
    PlayerEventModule,
    QuestGoalModule,
    QuestRewardModule,
    ServerEventModule,
} from './module-helpers';

export const ADAMANTIA_INTERNAL_BUNDLE = '_adamantia-internal-bundle';

export class BundleManager {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    private readonly _areas: string[] = [];
    private readonly _state: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(state: GameStateData) {
        const bundlePath: string | null = state.config.get('bundlesPath', null);
        const dataPath: string | null = state.config.get('dataPath', null);
        const rootPath: string | null = state.config.get('rootPath', null);

        if (!hasValue<string>(bundlePath) || !fs.existsSync(bundlePath)) {
            Logger.error(`Bundle path "${String(bundlePath)}" is not valid`);
            throw new Error('Invalid bundle path');
        }

        if (!hasValue<string>(dataPath) || !fs.existsSync(dataPath)) {
            Logger.error(`Data path "${String(dataPath)}" is not valid`);
            throw new Error('Invalid data path');
        }

        if (!hasValue<string>(rootPath) || !fs.existsSync(rootPath)) {
            Logger.error(`Root path "${String(rootPath)}" is not valid`);
            throw new Error('Invalid root path');
        }

        this._state = state;
    }

    private async _createCommand(uri: string, name: string, bundle: string): Promise<Command> {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        const commandImport: CommandModule = await import(uri);
        const loader = commandImport.default;

        const commandDef: CommandDefinition = {
            ...loader,
            command: loader.command(this._state),
        };

        return new Command(bundle, name, commandDef, uri);
    }

    private static _getAreaScriptPath(bundlePath: string, areaName: string): string {
        return path.join(bundlePath, 'areas', areaName, 'scripts');
    }

    private _hydrateAreas(): void {
        for (const areaRef of this._areas) {
            const area = this._state.areaFactory.create(areaRef);

            try {
                area.hydrate(this._state);
            }
            catch (err: unknown) {
                logAndRethrow(err);
            }

            this._state.areaManager.addArea(area);
        }
    }

    private _isBundleEnabled(bundle: string, prefix: string = ''): boolean {
        if (prefix === 'core.') {
            return true;
        }

        return this._state.config
            .get<string[]>('bundles', [])
            .includes(`${prefix}${bundle}`);
    }

    private static _isValidBundle(bundle: string, bundlePath: string): boolean {
        return !(fs.statSync(bundlePath).isFile() || bundle === '.' || bundle === '..');
    }

    private async _loadArea(
        bundle: string,
        bundlePath: string,
        areaName: string,
        manifest: AreaManifest
    ): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- START`);

        const definition: AreaDefinition = {
            bundle: bundle,
            id: areaName,
            manifest: manifest,
            npcs: [],
            quests: [],
            rooms: [],
        };

        Logger.verbose(`LOAD: Area \`${areaName}\`: Quests...`);
        definition.quests = await this._loadQuests(bundle, areaName);

        /*
         * Logger.verbose(`LOAD: Area \`${areaName}\`: Items...`);
         * definition.items = await this._loadEntities(
         *     bundle,
         *     bundlePath,
         *     areaName,
         *     'items',
         *     this._state.itemFactory
         * );
         */

        Logger.verbose(`LOAD: Area \`${areaName}\`: NPCs...`);
        definition.npcs = await this._loadEntities(
            bundle,
            bundlePath,
            areaName,
            'npcs',
            this._state.mobFactory
        );

        Logger.verbose(`LOAD: Area \`${areaName}\`: Rooms...`);
        definition.rooms = await this._loadEntities(
            bundle,
            bundlePath,
            areaName,
            'rooms',
            this._state.roomFactory
        );

        this._state.areaFactory.setDefinition(areaName, definition);

        Logger.info(`LOAD: ${bundle} - Area \`${areaName}\` -- END`);
    }

    private async _loadAreas(bundle: string, bundlePath: string): Promise<void> {
        Logger.info(`LOAD: ${bundle} - Areas -- START`);

        const loader = this._state.entityLoaderRegistry.get('areas');

        if (!hasValue(loader)) {
            Logger.error('No entity loader set for areas.');
            return;
        }

        loader.setBundle(bundle);

        if (!await loader.hasData()) {
            return;
        }

        const areas = await loader.fetchAll<AreaManifest>();

        for (const [name, manifest] of Object.entries(areas)) {
            this._areas.push(name);

            await this._loadArea(bundle, bundlePath, name, manifest);
        }

        Logger.info(`LOAD: ${bundle} - Areas -- END`);
    }

    private async _loadAttributes(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'attributes.js');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Attributes -- START`);

        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        const attributeImport: AttributeModule = await import(uri);
        const attributes = attributeImport.default;

        const error = `Attributes file [${uri}] from bundle [${bundle}]`;

        if (!Array.isArray(attributes)) {
            Logger.error(`${error} does not define an array of attributes`);

            return Promise.resolve();
        }

        for (const attribute of attributes) {
            if (typeof attribute !== 'object') {
                Logger.error(`${error} not an object`);
            }
            else if (!('name' in attribute) || !('base' in attribute)) {
                Logger.error(`${error} does not include required properties name and base`);
            }
            else {
                Logger.verbose(`LOAD: ${bundle} - Attributes -> ${attribute.name}`);

                this._state
                    .attributeFactory
                    .add(attribute.name, attribute.base, attribute.formula ?? null, attribute.metadata);
            }
        }

        Logger.info(`LOAD: ${bundle} - Attributes -- END`);

        return Promise.resolve();
    }

    private async _loadBehaviors(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'behaviors');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Behaviors -- START`);

        const loadEntityBehaviors = async (
            type: string,
            manager: BehaviorManager,
            state: GameStateData
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

                    /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                    const behaviorImport: BehaviorModule = await import(behaviorPath);
                    const loader = behaviorImport.default;

                    const {listeners} = loader;

                    for (const [eventName, listener] of Object.entries(listeners)) {
                        manager.addListener(behaviorName, eventName, listener(state));
                    }
                }
            }
        };

        await loadEntityBehaviors('area', this._state.areaBehaviorManager, this._state);
        await loadEntityBehaviors('npc', this._state.mobBehaviorManager, this._state);
        await loadEntityBehaviors('item', this._state.itemBehaviorManager, this._state);
        await loadEntityBehaviors('room', this._state.roomBehaviorManager, this._state);

        Logger.info(`LOAD: ${bundle} - Behaviors -- END`);

        return Promise.resolve();
    }

    private async _loadBundle(bundle: string, bundlePath: string): Promise<void> {
        Logger.info(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- START`);

        await this._loadQuestGoals(bundle, bundlePath);
        await this._loadQuestRewards(bundle, bundlePath);
        await this._loadAttributes(bundle, bundlePath);
        await this._loadBehaviors(bundle, bundlePath);

        // await this.loadChannels(bundle, bundlePath);
        await this._loadNpcClasses(bundle, bundlePath);
        await this._loadPlayerClasses(bundle, bundlePath);
        await this._loadCommands(bundle, bundlePath);
        await this._loadEffects(bundle, bundlePath);
        await this._loadInputEvents(bundle, bundlePath);
        await this._loadServerEvents(bundle, bundlePath);
        await this._loadPlayerEvents(bundle, bundlePath);

        // await this.loadSkills(bundle, bundlePath);
        await this._loadHelp(bundle, bundlePath);

        await this._loadAreas(bundle, bundlePath);

        Logger.info(`LOAD: BUNDLE [\x1B[1;33m${bundle}\x1B[0m] -- END`);
    }

    private async _loadBundlesFromFolder(bundlesPath: string, prefix: string = ''): Promise<void> {
        const bundles = fs.readdirSync(bundlesPath);

        for (const bundle of bundles) {
            const bundlePath = path.join(bundlesPath, bundle);

            // only load bundles the user has configured to be loaded
            if (BundleManager._isValidBundle(bundle, bundlePath) && this._isBundleEnabled(bundle, prefix)) {
                await this._loadBundle(`${prefix}${bundle}`, bundlePath);
            }
        }
    }

    private async _loadCommands(bundle: string, bundlePath: string): Promise<void> {
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

                const command = await this._createCommand(commandPath, commandName, bundle);

                this._state.commandManager.add(command);
            }
        }

        Logger.info(`LOAD: ${bundle} - Commands -- END`);

        return Promise.resolve();
    }

    private async _loadEffects(bundle: string, bundlePath: string): Promise<void> {
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

                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const effectImport: EffectModule = await import(effectPath);
                const loader = effectImport.default;

                Logger.verbose(`LOAD: ${bundle} - Effects -> ${effectName}`);

                this._state
                    .effectFactory
                    .add(effectName, loader, this._state);
            }
        }

        Logger.info(`LOAD: ${bundle} - Effects -- END`);

        return Promise.resolve();
    }

    private async _loadEntities<
        E extends GameEntity | ScriptableEntity,
        EDef extends GameEntityDefinition | ScriptableEntityDefinition,
        T extends EntityFactory<E, EDef>
    >(
        bundle: string,
        bundlePath: string,
        areaName: string,
        type: string,
        factory: T
    ): Promise<string[]> {
        const loader = this._state.entityLoaderRegistry.get(type);

        if (!hasValue(loader)) {
            Logger.warn(`Could not find entity loader for type '${type}'`);

            return Promise.resolve([]);
        }

        loader.setBundle(bundle);
        loader.setArea(areaName);

        if (!await loader.hasData()) {
            return [];
        }

        const entities = await loader.fetchAll<EDef>();
        const scriptPath = BundleManager._getAreaScriptPath(bundlePath, areaName);

        return Promise.all(Object.values(entities).map(async (entity: EDef) => {
            const ref = EntityFactory.createRef(areaName, entity.id);

            factory.setDefinition(ref, entity);

            if ('script' in entity && hasValue(cast<ScriptableEntityDefinition>(entity).script)) {
                const script = cast<ScriptableEntityDefinition>(entity).script!;

                const scriptUri = path.join(scriptPath, type, script);

                Logger.verbose(`Loading entity script - [${ref}] -> ${script}`);

                try {
                    await this._loadEntityScript(factory, ref, scriptUri);
                }
                catch {
                    Logger.warn(`Missing entity script - [${ref}] -> ${script}`);
                }
            }

            return Promise.resolve(ref);
        }));
    }

    private async _loadEntityScript<
        E extends ScriptableEntity,
        EDef extends ScriptableEntityDefinition,
        T extends EntityFactory<E, EDef>
    >(
        factory: T,
        ref: string,
        scriptPath: string
    ): Promise<void> {
        /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
        const scriptImport: EntityScriptModule = await import(scriptPath);
        const loader = scriptImport.default;

        const {listeners} = loader;

        Logger.info(`LOAD: ${ref} - Script Listeners -- START`);

        for (const [eventName, listener] of Object.entries(listeners)) {
            Logger.verbose(`LOAD: ${ref} - Script Listeners -> ${eventName}`);

            factory.addScriptListener(ref, eventName, listener(this._state));
        }

        Logger.info(`LOAD: ${ref} - Script Listeners -- END`);
    }

    private async _loadHelp(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'help');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Help -- START`);

        const files = await fs.readdir(uri);

        for (const file of files) {
            const helpName = path.basename(file, path.extname(file));

            Logger.verbose(`LOAD: ${bundle} - Help -> ${helpName}`);

            const helpPath = path.join(uri, file);

            let contents = await fs.readFile(helpPath, 'utf8');

            if (contents.trim().endsWith('.yml')) {
                const referencedPath = path.join(uri, contents.trim());

                if (fs.existsSync(referencedPath)) {
                    contents = await fs.readFile(referencedPath, 'utf8');
                }
                else {
                    // @TODO: Error
                }
            }

            const helpData: HelpfileOptions = yaml.load(contents) as HelpfileOptions;

            const helpFile = new Helpfile(bundle, helpName, helpData);

            this._state.helpManager.add(helpFile);
        }

        Logger.info(`LOAD: ${bundle} - Help -- END`);

        return Promise.resolve();
    }

    private async _loadInputEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'input-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Input Events -- START`);
        const files = fs.readdirSync(uri);

        for (const eventFile of files) {
            const eventPath = path.join(uri, eventFile);

            if (Data.isScriptFile(eventPath, eventFile)) {
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const eventImport: InputEventModule = await import(eventPath);
                const inputEvent = eventImport.default;

                Logger.verbose(`LOAD: ${bundle} - Input Events -> ${inputEvent.name}`);

                this._state.streamEventManager.add(inputEvent.name, inputEvent.listener(this._state));
            }
        }

        Logger.info(`LOAD: ${bundle} - Input Events -- END`);

        return Promise.resolve();
    }

    private async _loadNpcClasses(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'classes', 'npcs');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - NPC Classes -- START`);
        const files = fs.readdirSync(uri);

        for (const classFile of files) {
            const classPath = path.join(uri, classFile);

            if (Data.isScriptFile(classPath, classFile)) {
                const className = path.basename(classFile, path.extname(classFile));

                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const classImport: CharacterClassModule = await import(classPath);
                const classDef = classImport.default;

                Logger.verbose(`LOAD: ${bundle} - NPC Classes -> ${className}`);

                this._state.npcClassManager.set(className, classDef);
            }
        }

        Logger.info(`LOAD: ${bundle} - NPC Classes -- END`);

        return Promise.resolve();
    }

    private async _loadPlayerClasses(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'classes', 'players');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Player Classes -- START`);
        const files = fs.readdirSync(uri);

        for (const classFile of files) {
            const classPath = path.join(uri, classFile);

            if (Data.isScriptFile(classPath, classFile)) {
                const className = path.basename(classFile, path.extname(classFile));

                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const classImport: CharacterClassModule = await import(classPath);
                const classDef = classImport.default;

                Logger.verbose(`LOAD: ${bundle} - Player Classes -> ${className}`);

                this._state.playerClassManager.set(className, classDef);
            }
        }

        Logger.info(`LOAD: ${bundle} - Player Classes -- END`);

        return Promise.resolve();
    }

    private async _loadPlayerEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'player-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Player Events -- START`);

        const files = fs.readdirSync(uri);

        for (const eventFile of files) {
            const eventPath = path.join(uri, eventFile);

            if (Data.isScriptFile(eventPath, eventFile)) {
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const eventImport: PlayerEventModule = await import(eventPath);
                const playerEvent = eventImport.default;

                Logger.verbose(`LOAD: ${bundle} - Player Events -> ${playerEvent.name}`);

                this._state.playerManager.addListener(playerEvent.name, playerEvent.listener(this._state));
            }
        }

        Logger.info(`LOAD: ${bundle} - Player Events -- END`);

        return Promise.resolve();
    }

    private async _loadQuestGoals(bundle: string, bundlePath: string): Promise<void> {
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

                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const goalImport: QuestGoalModule = await import(goalPath);
                const loader = goalImport.default;

                Logger.verbose(`LOAD: ${bundle} - Quest Goals -> ${goalName}`);

                this._state.questGoalManager.set(goalName, loader);
            }
        }

        Logger.info(`LOAD: ${bundle} - Quest Goals -- END`);

        return Promise.resolve();
    }

    private async _loadQuestRewards(bundle: string, bundlePath: string): Promise<void> {
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

                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const rewardImport: QuestRewardModule = await import(rewardPath);
                const loader = rewardImport.default;

                Logger.verbose(`LOAD: ${bundle} - Quest Rewards -> ${rewardName}`);

                this._state.questRewardManager.set(rewardName, loader);
            }
        }

        Logger.info(`LOAD: ${bundle} - Quest Rewards -- END`);

        return Promise.resolve();
    }

    private async _loadQuests(bundle: string, areaName: string): Promise<string[]> {
        const loader = this._state.entityLoaderRegistry.get('quests');

        let quests: {[key: string]: QuestDefinition} = {};

        if (hasValue(loader)) {
            loader.setBundle(bundle);
            loader.setArea(areaName);

            try {
                quests = await loader.fetchAll<QuestDefinition>();
            }
            catch {
                // no-op
            }
        }

        return Object.values(quests).map((quest: QuestDefinition) => {
            const ref = `${areaName}:${quest.id}`;

            Logger.verbose(`LOAD: ${bundle} - Areas -> ${areaName} -> Quests -> ${ref}`);

            this._state.questFactory.add(ref, areaName, quest.id, quest);

            return ref;
        });
    }

    private async _loadServerEvents(bundle: string, bundlePath: string): Promise<void> {
        const uri = path.join(bundlePath, 'server-events');

        if (!fs.existsSync(uri)) {
            return Promise.resolve();
        }

        Logger.info(`LOAD: ${bundle} - Server Events -- START`);

        const files = fs.readdirSync(uri);

        for (const eventFile of files) {
            const eventPath = path.join(uri, eventFile);

            if (Data.isScriptFile(eventPath, eventFile)) {
                /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
                const eventImport: ServerEventModule = await import(eventPath);
                const serverEvent = eventImport.default;

                Logger.verbose(`LOAD: ${bundle} - Server Events -> ${serverEvent.name}`);

                this._state.serverEventManager.add(serverEvent.name, serverEvent.listener(this._state));
            }
        }

        Logger.info(`LOAD: ${bundle} - Server Events -- END`);

        return Promise.resolve();
    }

    public async loadBundles(): Promise<void> {
        Logger.verbose('LOAD: BUNDLES -- START');

        const coreBundlesDir = path.join(__dirname, '..', 'core-bundles');
        const optionalBundlesDir = path.join(__dirname, '..', 'optional-bundles');
        const bundlePath: string = this._state.config.get('bundlesPath');

        await this._loadBundlesFromFolder(coreBundlesDir, 'core.');
        await this._loadBundlesFromFolder(optionalBundlesDir, 'adamantia.');
        await this._loadBundlesFromFolder(bundlePath);

        Logger.verbose('LOAD: BUNDLES -- END');

        /*
         * Distribution is done after all areas are loaded in case items in one
         * area depend on another area.
         */
        this._hydrateAreas();
    }
}

export default BundleManager;
