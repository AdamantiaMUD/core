import EventEmitter from 'events';

import Account from './account';
import Data from '../util/data';
import EntityLoader from '../data/entity-loader';
import EventManager from '../events/event-manager';
import GameState from '../game-state';
import Player from './player';

export type PlayerEventListener = (player: Player, ...args: any[]) => void;

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

        this.on('updateTick', this.tickAll);
    }

    public addListener(event: string | symbol, listener: PlayerEventListener): this {
        this.events.add(event as string, listener);

        return this;
    }

    public addPlayer(player: Player): void {
        this.players.set(this.keyify(player), player);
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

    public getPlayer(name): Player {
        return this.players.get(name.toLowerCase());
    }

    public getPlayersAsArray(): Player[] {
        return Array.from(this.players.values());
    }

    /**
     * Turn player into a key used by this class's map
     */
    public keyify(player: Player): string {
        return player.name.toLowerCase();
    }

    /**
     * Load a player for an account
     */
    public async loadPlayer(
        state: GameState,
        account: Account,
        username: string,
        force: boolean = false
    ): Promise<Player> {
        if (this.players.has(username) && !force) {
            return this.getPlayer(username);
        }

        if (!this.loader) {
            throw new Error('No entity loader configured for players');
        }

        const data: any = await this.loader.fetch(username);

        data.name = username;

        const player = new Player(data);

        player.account = account;

        this.events.attach(player);
        this.addPlayer(player);

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

        this.players.delete(this.keyify(player));
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
            player.emit('updateTick');
        }
    }
}

export default PlayerManager;
