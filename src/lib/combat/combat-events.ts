import Character from '../characters/character';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export interface CombatantAddedPayload {
    target: Character;
}

export const CombatantAddedEvent: MudEventConstructor<CombatantAddedPayload> = class extends MudEvent<CombatantAddedPayload> {
    public NAME: string = 'combatant-added';

    public target: Character;
};

export interface CombatantRemovedPayload {
    target: Character;
}

export const CombatantRemovedEvent: MudEventConstructor<CombatantRemovedPayload> = class extends MudEvent<CombatantRemovedPayload> {
    public NAME: string = 'combatant-removed';

    public target: Character;
};

export const CombatEndEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'combat-end';
};

export const CombatStartEvent: MudEventConstructor<never> = class extends MudEvent<never> {
    public NAME: string = 'combat-start';
};
