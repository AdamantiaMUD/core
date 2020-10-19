import type Broadcastable from '../broadcastable';
import type CharacterInterface from '../../characters/character-interface';
import type GameStateData from '../../game-state-data';

/**
 * Base channel audience class
 */
export class ChannelAudience implements Broadcastable {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public message: string;
    public sender: CharacterInterface;
    public state: GameStateData;
    /* eslint-enable @typescript-eslint/lines-between-class-members */

    public alterMessage(message: string): string {
        return message;
    }

    /**
     * Configure the current state for the audience. Called by {@link Channel#send}
     */
    public configure(options: {state: GameStateData; sender: CharacterInterface; message: string}): void {
        this.state = options.state;
        this.sender = options.sender;
        this.message = options.message;
    }

    public getBroadcastTargets(): Broadcastable[] {
        return this.state.playerManager.getPlayersAsArray();
    }
}

export default ChannelAudience;
