import MudEvent from '../../events/mud-event';

export class EffectActivatedEvent extends MudEvent<void> {
    public NAME: string = 'effect-activated';
}

export default EffectActivatedEvent;
