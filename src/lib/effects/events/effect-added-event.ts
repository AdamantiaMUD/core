import MudEvent from '../../events/mud-event';

export class EffectAddedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-added';
}

export default EffectAddedEvent;
