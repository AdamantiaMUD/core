import { sprintf } from 'sprintf-js';

import { sayAt } from '../../../lib/communication/broadcast.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import {
    type PlayerCommandQueuedPayload,
    PlayerCommandQueuedEvent,
} from '../../../lib/players/events/index.js';
import type Player from '../../../lib/players/player.js';

export const evt: PlayerEventListenerDefinition<PlayerCommandQueuedPayload> = {
    name: PlayerCommandQueuedEvent.getName(),
    listener:
        (): PlayerEventListener<PlayerCommandQueuedPayload> =>
        (player: Player, { idx }: PlayerCommandQueuedPayload): void => {
            const command = player.commandQueue.queue[idx];
            const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(idx));

            sayAt(
                player,
                `{yellow.bold Executing} '{white ${command.label}}' {yellow in} {white ${ttr}} {yellow seconds.}`
            );
        },
};

export default evt;
