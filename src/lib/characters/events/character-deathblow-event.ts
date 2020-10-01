import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';

export interface CharacterDeathblowPayload {
    skipParty?: boolean;
    target: CharacterInterface;
}

export class CharacterDeathblowEvent extends MudEvent<CharacterDeathblowPayload> {
    public NAME: string = 'deathblow';
    public skipParty?: boolean;
    public target: CharacterInterface;
}

export default CharacterDeathblowEvent;
