import MudEvent from '../../events/mud-event.js';

import type Character from '../../characters/character.js';

export interface CombatantAddedPayload {
    target: Character;
}

export class CombatantAddedEvent extends MudEvent<CombatantAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'combatant-added';
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CombatantAddedEvent;
