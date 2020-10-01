import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';

export interface CombatantRemovedPayload {
    target: CharacterInterface;
}

export class CombatantRemovedEvent extends MudEvent<CombatantRemovedPayload> {
    public NAME: string = 'combatant-removed';
    public target: CharacterInterface;
}

export default CombatantRemovedEvent;
