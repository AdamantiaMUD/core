import {CommanderStatic} from 'commander';

import {GameServerShutdownEvent, GameServerStartupEvent} from './game-server-events';
import {MudEventEmitter} from './events/mud-event';

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
    public startup(commander: CommanderStatic): void {
        /**
         * @event GameServer#startup
         * @param {CommanderStatic} commander
         */
        this.dispatch(new GameServerStartupEvent({commander}));
    }
}

export default GameServer;
