import MudEvent from '../../events/mud-event';

import type Effect from '../../effects/effect';

export interface CharacterEffectAddedPayload {
    effect: Effect;
}

export class CharacterEffectAddedEvent extends MudEvent<CharacterEffectAddedPayload> {
    public NAME: string = 'effect-added';
    public effect: Effect;
}

export default CharacterEffectAddedEvent;
