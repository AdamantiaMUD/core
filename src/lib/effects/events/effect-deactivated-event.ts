import MudEvent from '../../events/mud-event';

export class EffectDeactivatedEvent extends MudEvent<{}> {
    public NAME: string = 'effect-deactivated';
}

export default EffectDeactivatedEvent;
