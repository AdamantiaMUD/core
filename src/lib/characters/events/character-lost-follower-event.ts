import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterLostFollowerPayload {
    follower: CharacterInterface;
}

export class CharacterLostFollowerEvent extends MudEvent<CharacterLostFollowerPayload> {
    public NAME: string = 'lost-follower';
    public follower: CharacterInterface;
}

export default CharacterLostFollowerEvent;
