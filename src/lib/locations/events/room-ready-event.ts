import MudEvent from '../../events/mud-event.js';

export class RoomReadyEvent extends MudEvent<void> {
    public NAME: string = 'ready';
}

export default RoomReadyEvent;
