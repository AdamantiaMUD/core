import MudEvent from '../../events/mud-event';

export class EffectActivatedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-activated';
}

export default EffectActivatedEvent;
