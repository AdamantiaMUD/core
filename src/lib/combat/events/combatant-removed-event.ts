import type Character from '../../characters/character.js';
import MudEvent from '../../events/mud-event.js';

export interface CombatantRemovedPayload {
    target: Character;
}

export class CombatantRemovedEvent extends MudEvent<CombatantRemovedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'combatant-removed';
    public target!: Character;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CombatantRemovedEvent;
