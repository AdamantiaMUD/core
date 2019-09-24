import {CommanderStatic} from 'commander';
import PlayerManager from './players/player-manager';

import Config from './util/config';
import Data from './util/data';
import EventManager from './events/event-manager';
import GameServer from './game-server';
import AreaManager from './locations/area-manager';
import EventEmitter from "events";
import TransportStream from './communication/transport-stream';

const DEFAULT_TICK_FREQUENCY = 100;

export class GameState {
    private readonly _areaManager: AreaManager;
    private readonly _config: Config;
    // private readonly itemManager
    private readonly _inputEventManager: EventManager = new EventManager();
    private readonly _playerManager: PlayerManager = new PlayerManager();
    private readonly _server: GameServer = new GameServer();
    private readonly _serverEventManager: EventManager = new EventManager();

    private entityTickInterval = null;
    private playerTickInterval = null;

    public constructor(config: Config) {
        Data.setDataPath(config.get('dataPath'));

        this._areaManager = new AreaManager(this);
        this._config = config;
    }

    private attachServer(): void {
        this.serverEventManager.attach(this._server);
    }

    private startEntityTicker() {
        if (this.entityTickInterval !== null) {
            clearInterval(this.entityTickInterval);
        }

        this.entityTickInterval = setInterval(
            () => this.tickEntities(),
            this._config.get('entityTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    private startPlayerTicker() {
        if (this.playerTickInterval !== null) {
            clearInterval(this.playerTickInterval);
        }

        this.playerTickInterval = setInterval(
            () => this.tickPlayers(),
            this._config.get('playerTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    public get areaManager() {
        return this._areaManager;
    }

    public get config() {
        return this._config;
    }

    public get inputEventManager() {
        return this._inputEventManager;
    }

    public get playerManager() {
        return this._playerManager;
    }

    public get serverEventManager() {
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
