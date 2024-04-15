import MudEvent from '../../events/mud-event.js';

export class CombatEndEvent extends MudEvent<void> {
    public NAME: string = 'combat-end';
}

export default CombatEndEvent;
