import MudEvent from '../../events/mud-event';

import type Character from '../character';

export interface CharacterLostFollowerPayload {
    follower: Character;
}

export class CharacterLostFollowerEvent extends MudEvent<CharacterLostFollowerPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'lost-follower';
    public follower!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterLostFollowerEvent;
