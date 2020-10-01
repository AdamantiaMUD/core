import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterFollowedTargetPayload {
    target: CharacterInterface;
}

export class CharacterFollowedTargetEvent extends MudEvent<CharacterFollowedTargetPayload> {
    public NAME: string = 'followed';
    public target: CharacterInterface;
}

export default CharacterFollowedTargetEvent;
