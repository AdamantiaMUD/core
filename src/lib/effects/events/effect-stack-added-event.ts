import MudEvent from '../../events/mud-event';

import type Effect from '../effect';

export interface EffectStackAddedPayload {
    effect: Effect;
}

export class EffectStackAddedEvent extends MudEvent<EffectStackAddedPayload> {
    public NAME: string = 'effect-stack-added';
    public effect: Effect;
}

export default EffectStackAddedEvent;
