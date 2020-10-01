import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterUnfollowedTargetPayload {
    target: CharacterInterface;
}

export class CharacterUnfollowedTargetEvent extends MudEvent<CharacterUnfollowedTargetPayload> {
    public NAME: string = 'unfollowed';
    public target: CharacterInterface;
}

export default CharacterUnfollowedTargetEvent;
