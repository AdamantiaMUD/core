import {sprintf} from 'sprintf-js';

import Player from '~/lib/players/player';
import {MudEventListener, MudEventListenerFactory} from '~/lib/events/mud-event';
import {PlayerCommandQueuedEvent, PlayerCommandQueuedPayload} from '~/lib/players/player-events';
import {sayAt} from '~/lib/communication/broadcast';

export const evt: MudEventListenerFactory<PlayerCommandQueuedPayload> = {
    name: PlayerCommandQueuedEvent.getName(),
    listener: (): MudEventListener<PlayerCommandQueuedPayload> => (
        player: Player,
        {idx}: PlayerCommandQueuedPayload
    ): void => {
        const command = player.commandQueue.queue[idx];
        const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(idx));

        /* eslint-disable-next-line max-len */
        sayAt(player, `<b><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
    },
};

export default evt;
