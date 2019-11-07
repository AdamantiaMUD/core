import {sprintf} from 'sprintf-js';

import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerCommandQueuedEvent, PlayerCommandQueuedPayload} from '../../../lib/players/player-events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<PlayerCommandQueuedPayload> = {
    name: new PlayerCommandQueuedEvent().getName(),
    listener: (): MudEventListener<PlayerCommandQueuedPayload> => {
        return (player: Player, {idx}) => {
            const command = player.commandQueue.queue[idx];
            const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(idx));

            /* eslint-disable-next-line max-len */
            sayAt(player, `<b><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
        };
    },
};

export default evt;
