import EventEmitter from 'events';
import {CommanderStatic} from 'commander';

export class GameServer extends EventEmitter {
    /**
     * @fires GameServer#shutdown
     */
    public shutdown(): void {
        /**
         * @event GameServer#shutdown
         */
        this.emit('shutdown');
    }

    /**
     * @fires GameServer#startup
     */
    public startup(commander: CommanderStatic): void {
        /**
         * @event GameServer#startup
         * @param {CommanderStatic} commander
         */
        this.emit('startup', commander);
    }
}

export default GameServer;
