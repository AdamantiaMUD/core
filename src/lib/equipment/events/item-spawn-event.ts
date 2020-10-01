import MudEvent from '../../events/mud-event';

export class ItemSpawnEvent extends MudEvent<void> {
    public NAME: string = 'spawn';
}

export default ItemSpawnEvent;
