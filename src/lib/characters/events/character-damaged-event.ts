import MudEvent from '../../events/mud-event';

import type Damage from '../../combat/damage';

export interface CharacterDamagedPayload {
    amount: number;
    source: Damage;
}

export class CharacterDamagedEvent extends MudEvent<CharacterDamagedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'damaged';
    public amount: number;
    public source: Damage;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterDamagedEvent;
