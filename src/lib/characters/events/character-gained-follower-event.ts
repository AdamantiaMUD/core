import MudEvent from '../../events/mud-event.js';
import type Character from '../character.js';

export interface CharacterGainedFollowerPayload {
    follower: Character;
}

export class CharacterGainedFollowerEvent extends MudEvent<CharacterGainedFollowerPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'gained-follower';
    public follower!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterGainedFollowerEvent;
