import MudEvent from '../../events/mud-event';

import type Effect from '../../effects/effect';

export interface CharacterEffectRemovedPayload {
    effect: Effect;
}

export class CharacterEffectRemovedEvent extends MudEvent<CharacterEffectRemovedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'effect-removed';
    public effect!: Effect;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterEffectRemovedEvent;
