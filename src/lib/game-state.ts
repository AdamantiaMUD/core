import path from 'path';
import {CommanderStatic} from 'commander';

import AreaFactory from './locations/area-factory';
import AreaManager from './locations/area-manager';
import Config from './util/config';
import Data from './util/data';
import EventEmitter from "events";
import EventManager from './events/event-manager';
import GameServer from './game-server';
import PlayerManager from './players/player-manager';
import RoomFactory from './locations/room-factory';
import RoomManager from './locations/room-manager';
import TransportStream from './communication/transport-stream';

const DEFAULT_TICK_FREQUENCY = 100;

export class GameState {
    private readonly _areaFactory: AreaFactory = new AreaFactory();
    private readonly _areaManager: AreaManager;
    private readonly _config: Config;
    // private readonly itemManager
    private readonly _inputEventManager: EventManager = new EventManager();
    private readonly _playerManager: PlayerManager = new PlayerManager();
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

    public get areaFactory(): AreaFactory {
        return this._areaFactory;
    }

    public get areaManager(): AreaManager {
        return this._areaManager;
    }

    public get config(): Config {
        return this._config;
    }

    public get inputEventManager(): EventManager {
        return this._inputEventManager;
    }

    public get playerManager(): PlayerManager {
        return this._playerManager;
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
        this._areaManager.emit('updateTick');
    }

    public tickPlayers(): void {
        this._playerManager.emit('updateTick');
    }
}

export default GameState;
