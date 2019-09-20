import {CommanderStatic} from 'commander';
import PlayerManager from './players/player-manager';

import Config from './util/config';
import Data from './util/data';
import EventManager from './events/event-manager';
import GameServer from './game-server';

const DEFAULT_TICK_FREQUENCY = 100;

export class GameState {
    private entityTickInterval = null;
    private playerTickInterval = null;

    // public areaManager
    public config: Config = null;
    // public itemManager
    public playerManager: PlayerManager = new PlayerManager();
    public server: GameServer = new GameServer();
    public serverEventManager: EventManager = new EventManager();

    public constructor(config: Config) {
        Data.setDataPath(config.get('dataPath'));

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

    public startServer(commander: CommanderStatic): void {
        this.attachServer();

        this.server.startup(commander);

        this.startEntityTicker();
        this.startPlayerTicker();
    }

    public tickEntities(): void {

    }

    public tickPlayers(): void {
        this.playerManager.emit('updateTick');
    }
}

export default GameState;
