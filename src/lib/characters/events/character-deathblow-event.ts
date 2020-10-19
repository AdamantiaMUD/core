import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterDeathblowPayload {
    shouldSkipParty?: boolean;
    target: CharacterInterface;
}

export class CharacterDeathblowEvent extends MudEvent<CharacterDeathblowPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'deathblow';
    public shouldSkipParty?: boolean;
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterDeathblowEvent;
