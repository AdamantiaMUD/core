import MudEvent from '../../events/mud-event.js';

export class ItemSpawnEvent extends MudEvent<void> {
    public NAME: string = 'spawn';
}

export default ItemSpawnEvent;
