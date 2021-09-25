import MudEvent from '../../events/mud-event';

export class RoomReadyEvent extends MudEvent<void> {
    public NAME: string = 'ready';
}

export default RoomReadyEvent;
