import StreamEvent from '../../../../lib/events/stream-event';

import type Player from '../../../../lib/players/player';

export interface CommandLoopPayload {
    player: Player;
}

export class CommandLoopEvent extends StreamEvent<CommandLoopPayload> {
    /* eslint-disable @typescript-eslint/lines-between-class-members */
    public NAME: string = 'commands';
    public player: Player;
    /* eslint-enable @typescript-eslint/lines-between-class-members */
}

export default CommandLoopEvent;
