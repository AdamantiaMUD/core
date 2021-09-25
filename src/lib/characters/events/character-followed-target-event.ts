import MudEvent from '../../events/mud-event';

import type Character from '../character';

export interface CharacterFollowedTargetPayload {
    target: Character;
}

export class CharacterFollowedTargetEvent extends MudEvent<CharacterFollowedTargetPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'followed';
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterFollowedTargetEvent;
