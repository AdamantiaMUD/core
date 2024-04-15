import MudEvent from '../../events/mud-event.js';

export class CombatStartEvent extends MudEvent<void> {
    public NAME: string = 'combat-start';
}

export default CombatStartEvent;
