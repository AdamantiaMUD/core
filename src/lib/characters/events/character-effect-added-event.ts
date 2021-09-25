import MudEvent from '../../events/mud-event';

import type Effect from '../../effects/effect';

export interface CharacterEffectAddedPayload {
    effect: Effect;
}

export class CharacterEffectAddedEvent extends MudEvent<CharacterEffectAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'effect-added';
    public effect!: Effect;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CharacterEffectAddedEvent;
