import EventEmitter from 'events';
import path from 'path';
import {CommanderStatic} from 'commander';

import AccountManager from './players/account-manager';
import AreaFactory from './locations/area-factory';
import AreaManager from './locations/area-manager';
import BehaviorManager from './behaviors/behavior-manager';
import ChannelManager from './communication/channels/channel-manager';
import CommandManager from './commands/command-manager';
import Config from './util/config';
import Data from './util/data';
import EntityLoaderRegistry from './data/entity-loader-registry';
import EventManager from './events/event-manager';
import GameServer from './game-server';
import HelpManager from './help/help-manager';
import ItemFactory from './equipment/item-factory';
import ItemManager from './equipment/item-manager';
import PlayerManager from './players/player-manager';
import RoomFactory from './locations/room-factory';
import RoomManager from './locations/room-manager';
import TransportStream from './communication/transport-stream';

const DEFAULT_TICK_FREQUENCY = 100;

export class GameState {
    private readonly _accountManager: AccountManager = new AccountManager();
    private readonly _areaBehaviorManager: BehaviorManager = new BehaviorManager();
    private readonly _areaFactory: AreaFactory = new AreaFactory();
    private readonly _areaManager: AreaManager;
    private readonly _channelManager: ChannelManager = new ChannelManager();
    private readonly _commandManager: CommandManager = new CommandManager();
    private readonly _config: Config;
    private readonly _entityLoaderRegistry: EntityLoaderRegistry;
    private readonly _helpManager: HelpManager = new HelpManager();
    private readonly _inputEventManager: EventManager = new EventManager();
    private readonly _itemBehaviorManager: BehaviorManager = new BehaviorManager();
    private readonly _itemManager: ItemManager = new ItemManager();
    private readonly _itemFactory: ItemFactory = new ItemFactory();
    private readonly _mobBehaviorManager: BehaviorManager = new BehaviorManager();
    private readonly _playerManager: PlayerManager = new PlayerManager();
    private readonly _roomBehaviorManager: BehaviorManager = new BehaviorManager();
    private readonly _roomFactory: RoomFactory = new RoomFactory();
    private readonly _roomManager: RoomManager = new RoomManager();
    private readonly _server: GameServer = new GameServer();
    private readonly _serverEventManager: EventManager = new EventManager();

    private entityTickInterval = null;
    private playerTickInterval = null;

    public constructor(config: Config) {
        Data.setDataPath(config.get('dataPath'));

        config.set('core.bundlesPath', path.join(__dirname, '..', 'core-bundles'));
        config.set('core.rootPath', path.join(__dirname, '..'));

        this._areaManager = new AreaManager(this);
        this._config = config;
        this._entityLoaderRegistry = new EntityLoaderRegistry(config.get('entityLoaders'), config);

        this._accountManager.setLoader(this._entityLoaderRegistry.get('accounts'));
        this._playerManager.setLoader(this._entityLoaderRegistry.get('players'));
    }

    private attachServer(): void {
        this.serverEventManager.attach(this._server);
    }

    private startEntityTicker(): void {
        if (this.entityTickInterval !== null) {
            clearInterval(this.entityTickInterval);
        }

        this.entityTickInterval = setInterval(
            () => this.tickEntities(),
            this._config.get('entityTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    private startPlayerTicker(): void {
        if (this.playerTickInterval !== null) {
            clearInterval(this.playerTickInterval);
        }

        this.playerTickInterval = setInterval(
            () => this.tickPlayers(),
            this._config.get('playerTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    public get accountManager(): AccountManager {
        return this._accountManager;
    }

    public get areaBehaviorManager(): BehaviorManager {
        return this._areaBehaviorManager;
    }

    public get areaFactory(): AreaFactory {
        return this._areaFactory;
    }

    public get areaManager(): AreaManager {
        return this._areaManager;
    }

    public get channelManager(): ChannelManager {
        return this._channelManager;
    }

    public get commandManager(): CommandManager {
        return this._commandManager;
    }

    public get config(): Config {
        return this._config;
    }

    public get entityLoaderRegistry(): EntityLoaderRegistry {
        return this._entityLoaderRegistry;
    }

    public get helpManager(): HelpManager {
        return this._helpManager;
    }

    public get inputEventManager(): EventManager {
        return this._inputEventManager;
    }

    public get itemBehaviorManager(): BehaviorManager {
        return this._itemBehaviorManager;
    }

    public get itemFactory(): ItemFactory {
        return this._itemFactory;
    }

    public get itemManager(): ItemManager {
        return this._itemManager;
    }

    public get mobBehaviorManager(): BehaviorManager {
        return this._mobBehaviorManager;
    }

    public get playerManager(): PlayerManager {
        return this._playerManager;
    }

    public get roomBehaviorManager(): BehaviorManager {
        return this._roomBehaviorManager;
    }

    public get roomFactory(): RoomFactory {
        return this._roomFactory;
    }

    public get roomManager(): RoomManager {
        return this._roomManager;
    }

    public get serverEventManager(): EventManager {
        return this._serverEventManager;
    }

    public attachServerStream<S extends TransportStream<T>, T extends EventEmitter>(stream: S): void {
        this._inputEventManager.attach(stream);
    }

    public startServer(commander: CommanderStatic): void {
        this.attachServer();

        this._server.startup(commander);

        this.startEntityTicker();
        this.startPlayerTicker();
    }

    public tickEntities(): void {
        this._areaManager.emit('update-tick');
    }

    public tickPlayers(): void {
        this._playerManager.emit('update-tick');
    }
}

export default GameState;
