import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterGainedFollowerPayload {
    follower: CharacterInterface;
}

export class CharacterGainedFollowerEvent extends MudEvent<CharacterGainedFollowerPayload> {
    public NAME: string = 'gained-follower';
    public follower: CharacterInterface;
}

export default CharacterGainedFollowerEvent;
