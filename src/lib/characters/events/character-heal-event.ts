import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../character-interface';
import type Heal from '../../combat/heal';

export interface CharacterHealPayload {
    amount: number;
    source: Heal;
    target: CharacterInterface;
}

export class CharacterHealEvent extends MudEvent<CharacterHealPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'heal';
    public amount: number;
    public source: Heal;
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterHealEvent;
