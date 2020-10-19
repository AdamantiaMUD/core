import MudEvent from '../../events/mud-event';

import type CharacterInterface from '../../characters/character-interface';

export interface CombatantRemovedPayload {
    target: CharacterInterface;
}

export class CombatantRemovedEvent extends MudEvent<CombatantRemovedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'combatant-removed';
    public target: CharacterInterface;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CombatantRemovedEvent;
