import MudEvent from '../../events/mud-event';

export class EffectRemovedEvent extends MudEvent<void> {
    public NAME: string = 'effect-removed';
}

export default EffectRemovedEvent;
