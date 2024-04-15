import MudEvent from '../../events/mud-event.js';

import type Heal from '../../combat/heal.js';

export interface CharacterHealedPayload {
    amount: number;
    source: Heal;
}

export class CharacterHealedEvent extends MudEvent<CharacterHealedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'healed';
    public amount!: number;
    public source!: Heal;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterHealedEvent;
