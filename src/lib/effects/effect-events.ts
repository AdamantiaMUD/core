import MudEvent from '../events/mud-event';

import type Effect from './effect';

export class EffectActivatedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-activated';
}

export class EffectAddedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-added';
}

export class EffectDeactivatedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-deactivated';
}

export interface EffectRefreshedPayload {
    effect: Effect;
}

export class EffectRefreshedEvent extends MudEvent<EffectRefreshedPayload> {
    public NAME: string = 'effect-refreshed';
    public effect: Effect;
}

export class EffectRemoveEvent extends MudEvent<{}> {
    public NAME: string = 'remove';
}

export interface EffectStackAddedPayload {
    effect: Effect;
}

export class EffectStackAddedEvent extends MudEvent<EffectStackAddedPayload> {
    public NAME: string = 'effect-stack-added';
    public effect: Effect;
}
