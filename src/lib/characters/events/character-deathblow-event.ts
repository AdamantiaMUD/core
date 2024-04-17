import MudEvent from '../../events/mud-event.js';
import type Character from '../character.js';

export interface CharacterDeathblowPayload {
    shouldSkipParty?: boolean;
    target: Character;
}

export class CharacterDeathblowEvent extends MudEvent<CharacterDeathblowPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'deathblow';
    public shouldSkipParty?: boolean;
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterDeathblowEvent;
