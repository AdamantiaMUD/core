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
    private readonly areaManager: AreaManager = null;
    private readonly config: Config = null;
    // private readonly itemManager
    private readonly inputEventManager: EventManager = new EventManager();
    private readonly playerManager: PlayerManager = new PlayerManager();
    private readonly server: GameServer = new GameServer();
    private readonly serverEventManager: EventManager = new EventManager();

    private entityTickInterval = null;
    private playerTickInterval = null;

    public constructor(config: Config) {
        Data.setDataPath(config.get('dataPath'));

        this.areaManager = new AreaManager(this);
        this.config = config;
    }

    private attachServer(): void {
        this.serverEventManager.attach(this.server);
    }

    private startEntityTicker() {
        if (this.entityTickInterval !== null) {
            clearInterval(this.entityTickInterval);
        }

        this.entityTickInterval = setInterval(
            () => this.tickEntities(),
            this.config.get('entityTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    private startPlayerTicker() {
        if (this.playerTickInterval !== null) {
            clearInterval(this.playerTickInterval);
        }

        this.playerTickInterval = setInterval(
            () => this.tickPlayers(),
            this.config.get('playerTickFrequency', DEFAULT_TICK_FREQUENCY)
        );
    }

    public attachServerStream<S extends TransportStream<T>, T extends EventEmitter>(stream: S): void {
        this.inputEventManager.attach(stream);
    }

    public startServer(commander: CommanderStatic): void {
        this.attachServer();

        this.server.startup(commander);

        this.startEntityTicker();
        this.startPlayerTicker();
    }

    public tickEntities(): void {
        this.areaManager.emit('updateTick');
    }

    public tickPlayers(): void {
        this.playerManager.emit('updateTick');
    }
}

export default GameState;
