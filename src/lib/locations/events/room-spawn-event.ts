import MudEvent from '../../events/mud-event';

export class RoomSpawnEvent extends MudEvent<void> {
    public NAME: string = 'spawn';
}

export default RoomSpawnEvent;
