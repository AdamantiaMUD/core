import MudEvent from '../../events/mud-event.js';

export class EffectAddedEvent extends MudEvent<void> {
    public NAME: string = 'effect-added';
}

export default EffectAddedEvent;
