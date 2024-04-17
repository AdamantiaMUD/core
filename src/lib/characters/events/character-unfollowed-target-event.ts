import MudEvent from '../../events/mud-event.js';
import type Character from '../character.js';

export interface CharacterUnfollowedTargetPayload {
    target: Character;
}

export class CharacterUnfollowedTargetEvent extends MudEvent<CharacterUnfollowedTargetPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'unfollowed';
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterUnfollowedTargetEvent;
