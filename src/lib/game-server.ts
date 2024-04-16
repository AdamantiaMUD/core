import type { Command } from 'commander';

import MudEventEmitter from './events/mud-event-emitter.js';
import {
    GameServerShutdownEvent,
    GameServerStartupEvent,
} from './game-server/events/index.js';

export class GameServer extends MudEventEmitter {
    /**
     * @fires GameServer#shutdown
     */
    public shutdown(): void {
        /**
         * @event GameServer#shutdown
         */
        this.dispatch(new GameServerShutdownEvent());
    }

    /**
     * @fires GameServer#startup
     */
    public startup(commander: Command): void {
        /**
         * @event GameServer#startup
         * @param {Command} commander
         */
        this.dispatch(new GameServerStartupEvent({ commander }));
    }
}

export default GameServer;
