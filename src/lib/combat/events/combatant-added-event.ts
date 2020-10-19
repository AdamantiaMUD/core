import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';

export interface CombatantAddedPayload {
    target: CharacterInterface;
}

export class CombatantAddedEvent extends MudEvent<CombatantAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'combatant-added';
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CombatantAddedEvent;
