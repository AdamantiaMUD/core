import type Heal from '../../combat/heal.js';
import MudEvent from '../../events/mud-event.js';
import type Character from '../character.js';

export interface CharacterHealPayload {
    amount: number;
    source: Heal;
    target: Character;
}

export class CharacterHealEvent extends MudEvent<CharacterHealPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'heal';
    public amount!: number;
    public source!: Heal;
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterHealEvent;
