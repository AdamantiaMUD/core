import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterLostFollowerPayload {
    follower: CharacterInterface;
}

export class CharacterLostFollowerEvent extends MudEvent<CharacterLostFollowerPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'lost-follower';
    public follower: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterLostFollowerEvent;
