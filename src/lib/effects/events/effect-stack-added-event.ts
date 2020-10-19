import MudEvent from '../../events/mud-event';

import type Effect from '../effect';

export interface EffectStackAddedPayload {
    effect: Effect;
}

export class EffectStackAddedEvent extends MudEvent<EffectStackAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'effect-stack-added';
    public effect: Effect;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default EffectStackAddedEvent;
