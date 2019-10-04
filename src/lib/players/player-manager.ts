import EventEmitter from 'events';

import Data from '../util/data';
import EntityLoader from '../data/entity-loader';
import EventManager from '../events/event-manager';
import GameState from '../game-state';
import Logger from '../util/logger';
import Player, {SerializedPlayer} from './player';
import {PlayerEventListener} from '../events/player-events';

/**
 * Keeps track of all active players in game
 */
export class PlayerManager extends EventEmitter {
    /* eslint-disable lines-between-class-members */
    public events: EventManager = new EventManager();
    public loader: EntityLoader = null;
    public players: Map<string, Player> = new Map();
    /* eslint-enable lines-between-class-members */

    public constructor() {
        super();

        this.on('update-tick', this.tickAll);
    }

    public addListener(event: string | symbol, listener: PlayerEventListener): this {
        this.events.add(event as string, listener);

        return this;
    }

    public addPlayer(username: string, player: Player): void {
        this.players.set(username, player);
    }

    public exists(name: string): boolean {
        return Data.exists('player', name);
    }

    public filter(fn: (Player) => boolean): Player[] {
        return this.getPlayersAsArray().filter(fn);
    }

    public getBroadcastTargets(): Player[] {
        return this.getPlayersAsArray();
    }

    public getPlayer(name: string): Player {
        return this.players.get(name.toLowerCase());
    }

    public getPlayersAsArray(): Player[] {
        return Array.from(this.players.values());
    }

    /**
     * Load a player for an account
     */
    public async loadPlayer(
        state: GameState,
        username: string,
        force: boolean = false
    ): Promise<Player> {
        if (this.players.has(username) && !force) {
            return this.getPlayer(username);
        }

        if (!this.loader) {
            throw new Error('No entity loader configured for players');
        }

        const data: SerializedPlayer = await this.loader.fetch(username);

        const player = new Player();

        player.deserialize(data, state);

        this.events.attach(player);
        this.addPlayer(username, player);

        return player;
    }

    /**
     * Remove the player from the game.
     *
     * WARNING: You must manually save the player first as this will modify
     * serializable properties
     */
    public removePlayer(player: Player, killSocket: boolean = false): void {
        if (killSocket) {
            player.socket.end();
        }

        player.removeAllListeners();

        if (player.room) {
            player.room.removePlayer(player);
        }

        player.__pruned = true;

        this.players.delete(player.name.toLowerCase());
    }

    public async save(player: Player): Promise<void> {
        if (!this.loader) {
            throw new Error('No entity loader configured for players');
        }

        await this.loader.update(player.name, player.serialize());

        player.emit('saved');
    }

    public async saveAll(): Promise<void> {
        for (const [, player] of this.players.entries()) {
            /* eslint-disable-next-line no-await-in-loop */
            await this.save(player);
        }
    }

    public setLoader(loader: EntityLoader): void {
        this.loader = loader;
    }

    public tickAll(): void {
        for (const [, player] of this.players.entries()) {
            player.emit('update-tick');
        }
    }
}

export default PlayerManager;
