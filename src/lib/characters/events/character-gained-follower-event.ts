import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterGainedFollowerPayload {
    follower: CharacterInterface;
}

export class CharacterGainedFollowerEvent extends MudEvent<CharacterGainedFollowerPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'gained-follower';
    public follower: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterGainedFollowerEvent;
