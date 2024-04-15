import PlayerLoader from '../data/player-loader.js';
import Data from '../util/data.js';
import MudEventEmitter from '../events/mud-event-emitter.js';
import MudEventManager from '../events/mud-event-manager.js';
import Player from './player.js';
import {PlayerSavedEvent} from './events/index.js';
import {UpdateTickEvent} from '../common/events/index.js';
import {hasValue} from '../util/functions.js';

import type GameStateData from '../game-state-data.js';
import type MudEventListener from '../events/mud-event-listener.js';
import type SerializedPlayer from './serialized-player.js';

/**
 * Keeps track of all active players in game
 */
export class PlayerManager extends MudEventEmitter {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public events: MudEventManager = new MudEventManager();

    private readonly _loader: PlayerLoader = new PlayerLoader();
    private readonly _players: Map<string, Player> = new Map<string, Player>();
    private readonly _state: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public constructor(state: GameStateData) {
        super();

        this._state = state;

        this.listen(UpdateTickEvent.getName(), this.tickAll.bind(this));
    }

    public get players(): Map<string, Player> {
        return this._players;
    }

    public addListener(event: string | symbol, listener: MudEventListener): this {
        this.events.add(event as string, listener);

        return this;
    }

    public addPlayer(username: string, player: Player): void {
        this._players.set(username, player);
    }

    public exists(name: string): boolean {
        return Data.exists('player', name);
    }

    public filter(fn: (char: Player) => boolean): Player[] {
        return this.getPlayersAsArray().filter(fn);
    }

    public getBroadcastTargets(): Player[] {
        return this.getPlayersAsArray();
    }

    public getPlayer(name: string): Player | null {
        return this._players.get(name.toLowerCase()) ?? null;
    }

    public getPlayersAsArray(): Player[] {
        return Array.from(this._players.values());
    }

    /**
     * Load a player for an account
     */
    public async loadPlayer(username: string, force: boolean = false): Promise<Player> {
        if (this._players.has(username) && !force) {
            return this.getPlayer(username)!;
        }

        const data: SerializedPlayer | null = await this._loader.loadPlayer(username, this._state.config);

        if (!hasValue(data)) {
            throw new Error('That player name does not exist... how did we get here?');
        }

        const player = new Player();

        player.deserialize(data, this._state);

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
            player.socket?.end();
        }

        player.stopListening();

        if (hasValue(player.room)) {
            player.room.removePlayer(player);
        }

        player.setPruned();

        this._players.delete(player.name.toLowerCase());
    }

    public async save(player: Player): Promise<void> {
        await this._loader.savePlayer(player.name, player.serialize(), this._state.config);

        player.dispatch(new PlayerSavedEvent());
    }

    public async saveAll(): Promise<void> {
        for (const [, player] of this._players.entries()) {
            /* eslint-disable-next-line no-await-in-loop */
            await this.save(player);
        }
    }

    public tickAll(): void {
        for (const [, player] of this._players.entries()) {
            player.dispatch(new UpdateTickEvent());
        }
    }
}

export default PlayerManager;
