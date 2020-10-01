import MudEvent from '../../events/mud-event';

import type Damage from '../../combat/damage';

export interface CharacterDamagedPayload {
    amount: number;
    source: Damage;
}

export class CharacterDamagedEvent extends MudEvent<CharacterDamagedPayload> {
    public NAME: string = 'damaged';
    public amount: number;
    public source: Damage;
}

export default CharacterDamagedEvent;
