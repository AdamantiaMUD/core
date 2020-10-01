import MudEvent from '../../events/mud-event';

import type Heal from '../../combat/heal';

export interface CharacterHealedPayload {
    amount: number;
    source: Heal;
}

export class CharacterHealedEvent extends MudEvent<CharacterHealedPayload> {
    public NAME: string = 'healed';
    public amount: number;
    public source: Heal;
}

export default CharacterHealedEvent;
