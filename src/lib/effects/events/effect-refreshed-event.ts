import MudEvent from '../../events/mud-event';

import type Effect from '../effect';

export interface EffectRefreshedPayload {
    effect: Effect;
}

export class EffectRefreshedEvent extends MudEvent<EffectRefreshedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'effect-refreshed';
    public effect: Effect;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default EffectRefreshedEvent;
