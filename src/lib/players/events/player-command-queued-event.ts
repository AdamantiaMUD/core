import MudEvent from '../../events/mud-event';

export interface PlayerCommandQueuedPayload {
    idx: number;
}

export class PlayerCommandQueuedEvent extends MudEvent<PlayerCommandQueuedPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'command-queued';
    public idx: number;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default PlayerCommandQueuedEvent;
