import type Broadcastable from '../broadcastable.js';
import type Character from '../../characters/character.js';
import type GameStateData from '../../game-state-data.js';

/**
 * Base channel audience class
 */
export class ChannelAudience implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public message: string = '';
    public sender: Character | null = null;
    public state: GameStateData | null = null;
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

    public getBroadcastTargets(): Broadcastable[] {
        if (this.state === null) {
            // @TODO: throw?
            return [];
        }

        return this.state.playerManager.getPlayersAsArray();
    }
}

export default ChannelAudience;
