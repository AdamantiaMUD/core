import MudEvent from '../../events/mud-event.js';

export class EffectRemovedEvent extends MudEvent<void> {
    public NAME: string = 'effect-removed';
}

export default EffectRemovedEvent;
