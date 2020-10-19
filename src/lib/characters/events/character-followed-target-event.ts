import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterFollowedTargetPayload {
    target: CharacterInterface;
}

export class CharacterFollowedTargetEvent extends MudEvent<CharacterFollowedTargetPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'followed';
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterFollowedTargetEvent;
