import MudEvent from '../../events/mud-event.js';

import type Effect from '../effect.js';

export interface EffectStackAddedPayload {
    effect: Effect;
}

export class EffectStackAddedEvent extends MudEvent<EffectStackAddedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'effect-stack-added';
    public effect!: Effect;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default EffectStackAddedEvent;
