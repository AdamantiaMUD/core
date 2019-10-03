import {sprintf} from 'sprintf-js';

import Broadcast from '../../../../lib/communication/broadcast';
import Player from '../../../../lib/players/player';
import {PlayerEventListener} from '../../../../lib/players/player-manager';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = (): PlayerEventListener => {
    /**
     * @listens Player#commandQueued
     */
    return (player: Player, commandIndex: number) => {
        const command = player.commandQueue.queue[commandIndex];
        const ttr = sprintf('%.1f', player.commandQueue.getTimeTilRun(commandIndex));

        /* eslint-disable-next-line max-len */
        sayAt(player, `<b><yellow>Executing</yellow> '<white>${command.label}</white>' <yellow>in</yellow> <white>${ttr}</white> <yellow>seconds.</yellow>`);
    };
};

export default evt;
