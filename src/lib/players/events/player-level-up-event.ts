import MudEvent from '../../events/mud-event.js';

export class PlayerLevelUpEvent extends MudEvent<void> {
    public NAME: string = 'level-up';
}

export default PlayerLevelUpEvent;
