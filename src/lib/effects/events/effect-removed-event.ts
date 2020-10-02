import MudEvent from '../../events/mud-event';

export class EffectRemovedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-removed';
}

export default EffectRemovedEvent;
