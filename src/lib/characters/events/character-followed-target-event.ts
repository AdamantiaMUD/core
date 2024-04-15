import MudEvent from '../../events/mud-event.js';

import type Character from '../character.js';

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
