import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterUnfollowedTargetPayload {
    target: CharacterInterface;
}

export class CharacterUnfollowedTargetEvent extends MudEvent<CharacterUnfollowedTargetPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'unfollowed';
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterUnfollowedTargetEvent;
