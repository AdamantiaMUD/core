import MudEvent from '../../events/mud-event';

export class EffectAddedEvent extends MudEvent<void> {
    public NAME: string = 'effect-added';
}

export default EffectAddedEvent;
