import MudEvent from '../../events/mud-event';

export class EffectDeactivatedEvent extends MudEvent<void> {
    public NAME: string = 'effect-deactivated';
}

export default EffectDeactivatedEvent;
