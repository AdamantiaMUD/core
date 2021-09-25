import MudEvent from '../../events/mud-event';

export class CombatStartEvent extends MudEvent<void> {
    public NAME: string = 'combat-start';
}

export default CombatStartEvent;
