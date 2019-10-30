import Effect from './effect';
import {MudEvent, MudEventConstructor} from '../events/mud-event';

export const EffectActivatedEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public static NAME: string = 'effect-activated';
};

export const EffectAddedEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public static NAME: string = 'effect-added';
};

export const EffectDeactivatedEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public static NAME: string = 'effect-deactivated';
};

export interface EffectRefreshedPayload {
    effect: Effect;
}

export const EffectRefreshedEvent: MudEventConstructor<EffectRefreshedPayload> = class extends MudEvent<EffectRefreshedPayload> {
    public static NAME: string = 'effect-refreshed';
    public effect: Effect;
};

export const EffectRemoveEvent: MudEventConstructor<{}> = class extends MudEvent<{}> {
    public static NAME: string = 'remove';
};

export interface EffectStackAddedPayload {
    effect: Effect;
}

export const EffectStackAddedEvent: MudEventConstructor<EffectStackAddedPayload> = class extends MudEvent<EffectStackAddedPayload> {
    public static NAME: string = 'effect-stack-added';
    public effect: Effect;
};
