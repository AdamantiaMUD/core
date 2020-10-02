import MudEvent from '../../events/mud-event';

import type Effect from '../effect';

export interface EffectRefreshedPayload {
    effect: Effect;
}

export class EffectRefreshedEvent extends MudEvent<EffectRefreshedPayload> {
    public NAME: string = 'effect-refreshed';
    public effect: Effect;
}

export default EffectRefreshedEvent;
