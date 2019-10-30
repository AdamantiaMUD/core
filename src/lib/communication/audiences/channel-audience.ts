import Character from '../../characters/character';
import GameState from '../../game-state';
import Player from '../../players/player';
import {Broadcastable} from '../broadcast';

/**
 * Base channel audience class
 */
export class ChannelAudience implements Broadcastable {
    /* eslint-disable lines-between-class-members */
    public message: string;
    public sender: Character;
    public state: GameState;
    /* eslint-enable lines-between-class-members */

    public alterMessage(message: string): string {
        return message;
    }

    /**
     * Configure the current state for the audience. Called by {@link Channel#send}
     */
    public configure(options: {state: GameState; sender: Character; message: string}): void {
        this.state = options.state;
        this.sender = options.sender;
        this.message = options.message;
    }

    public getBroadcastTargets(): Player[] {
        return this.state.playerManager.getPlayersAsArray();
    }
}

export default ChannelAudience;
