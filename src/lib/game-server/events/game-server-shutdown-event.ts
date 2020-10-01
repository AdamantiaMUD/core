import MudEvent from '../../events/mud-event';

export class GameServerShutdownEvent extends MudEvent<void> {
    public NAME: string = 'shutdown';
}

export default GameServerShutdownEvent;
