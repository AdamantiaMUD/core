import MudEvent from '../../events/mud-event';

export class CombatEndEvent extends MudEvent<void> {
    public NAME: string = 'combat-end';
}

export default CombatEndEvent;
