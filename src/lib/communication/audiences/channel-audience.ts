import type Character from '../../characters/character';
import type GameStateData from '../../game-state-data';
import type Player from '../../players/player';
import type {Broadcastable} from '../broadcast';

/**
 * Base channel audience class
 */
export class ChannelAudience implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public message: string;
    public sender: Character;
    public state: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public alterMessage(message: string): string {
        return message;
    }

    /**
     * Configure the current state for the audience. Called by {@link Channel#send}
     */
    public configure(options: {state: GameStateData; sender: Character; message: string}): void {
        this.state = options.state;
        this.sender = options.sender;
        this.message = options.message;
    }

    public getBroadcastTargets(): Player[] {
        return this.state.playerManager.getPlayersAsArray();
    }
}

export default ChannelAudience;
