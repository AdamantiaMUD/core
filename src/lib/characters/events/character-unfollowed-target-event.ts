import MudEvent from '../../events/mud-event';

import type Character from '../character';

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
