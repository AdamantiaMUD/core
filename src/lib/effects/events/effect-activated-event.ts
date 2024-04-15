import MudEvent from '../../events/mud-event.js';

export class EffectActivatedEvent extends MudEvent<void> {
    public NAME: string = 'effect-activated';
}

export default EffectActivatedEvent;
