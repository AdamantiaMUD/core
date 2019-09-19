import {CommanderStatic} from 'commander';

import Config from './util/config';
import EventManager from './events/event-manager';
import GameServer from './game-server';

export class GameState {
    public config: Config = null;
    public server: GameServer = new GameServer();
    public serverEventManager: EventManager = new EventManager();

    public constructor(config: Config) {
        this.config = config;
    }

    public attachServer(): void {
        this.serverEventManager.attach(this.server);
    }

    public startServer(commander: CommanderStatic): void {
        this.server.startup(commander);
    }

    public tickEntities(): void {

    }

    public tickPlayers(): void {

    }
}

export default GameState;
