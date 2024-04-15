import MudEvent from '../../events/mud-event.js';

export class NpcSpawnEvent extends MudEvent<void> {
    public NAME: string = 'spawn';
}

export default NpcSpawnEvent;
