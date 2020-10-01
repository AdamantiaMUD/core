import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';

export interface CombatantAddedPayload {
    target: CharacterInterface;
}

export class CombatantAddedEvent extends MudEvent<CombatantAddedPayload> {
    public NAME: string = 'combatant-added';
    public target: CharacterInterface;
}

export default CombatantAddedEvent;
