import MudEvent from '../../events/mud-event';

import type Effect from '../../effects/effect';

export interface CharacterEffectRemovedPayload {
    effect: Effect;
}

export class CharacterEffectRemovedEvent extends MudEvent<CharacterEffectRemovedPayload> {
    public NAME: string = 'effect-removed';
    public effect: Effect;
}

export default CharacterEffectRemovedEvent;
