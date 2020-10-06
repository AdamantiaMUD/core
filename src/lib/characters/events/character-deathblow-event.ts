import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterDeathblowPayload {
    shouldSkipParty?: boolean;
    target: CharacterInterface;
}

export class CharacterDeathblowEvent extends MudEvent<CharacterDeathblowPayload> {
    public NAME: string = 'deathblow';
    public shouldSkipParty?: boolean;
    public target: CharacterInterface;
}

export default CharacterDeathblowEvent;
