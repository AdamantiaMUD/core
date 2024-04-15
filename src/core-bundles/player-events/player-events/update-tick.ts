import Logger from '../../../lib/common/logger.js';
import {UpdateTickEvent} from '../../../lib/common/events/index.js';
import {prompt, sayAt, sayAtExcept} from '../../../lib/communication/broadcast.js';

import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type {UpdateTickPayload} from '../../../lib/common/events/index.js';

export const evt: PlayerEventListenerDefinition<UpdateTickPayload> = {
    name: UpdateTickEvent.getName(),
    listener: (state: GameStateData): PlayerEventListener<UpdateTickPayload> => (player: Player): void => {
        if (player.commandQueue.hasPending && player.commandQueue.lagRemaining <= 0) {
            sayAt(player);
            player.commandQueue.execute();
            prompt(player);
        }

        const lastCommandTime: number = player.getMeta<number>('lastCommandTime') ?? Infinity;
        const timeSinceLastCommand = Date.now() - lastCommandTime;
        const maxIdleTime = Math.abs(state.config.get<number>('maxIdleTime', Infinity)!) * 60000;

        if (timeSinceLastCommand > maxIdleTime) {
            player.save(() => {
                sayAt(player, `You were kicked for being idle for more than ${maxIdleTime / 60000} minutes!`);
                sayAtExcept(player.room!, `${player.name} disappears.`, player);

                Logger.log(`Kicked ${player.name} for being idle.`);

                state.playerManager.removePlayer(player, true);
            });
        }
    },
};

export default evt;
