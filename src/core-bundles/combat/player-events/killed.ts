import Broadcast from '../../../lib/communication/broadcast.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type GameStateData from '../../../lib/game-state-data.js';
import {
    type PlayerKilledPayload,
    PlayerKilledEvent,
} from '../../../lib/players/events/index.js';
import type Player from '../../../lib/players/player.js';
import { isNpc } from '../../../lib/util/characters.js';
import { cast, hasValue } from '../../../lib/util/functions.js';

const { prompt, sayAt, sayAtExcept } = Broadcast;

export const evt: MudEventListenerDefinition<[Player, PlayerKilledPayload]> = {
    name: PlayerKilledEvent.getName(),
    listener: (
        state: GameStateData
    ): MudEventListener<[Player, PlayerKilledPayload]> => {
        const startingRoomRef = state.config.getStartingRoom();

        /**
         * @listens Player#killed
         */
        return (player: Player, payload: PlayerKilledPayload): void => {
            const killer = payload.killer ?? null;

            player.removePrompt('combat');

            if (!hasValue(player.room)) {
                // @TODO: throw?
                return;
            }

            const othersDeathMessage =
                killer === null
                    ? `{red.bold ${player.name} collapses to the ground, dead}`
                    : `{red.bold ${player.name} collapses to the ground, dead at the hands of ${killer.name}.}`;

            const excludeList: Player[] = [player];

            if (hasValue(killer) && !isNpc(killer)) {
                excludeList.push(cast<Player>(killer));
            }

            sayAtExcept(player.room, othersDeathMessage, excludeList);

            if (hasValue(player.party)) {
                sayAt(player.party, `{green.bold ${player.name} was killed!}`);
            }

            player.resetAttribute('hp');

            const waypoint = player.getMeta<string>('waypoint.home');

            let home = hasValue(waypoint)
                ? state.roomManager.getRoom(waypoint)
                : null;

            if (!hasValue(home)) {
                home = state.roomManager.getRoom(startingRoomRef);
            }

            player.moveTo(home!, () => {
                state.commandManager.get('look')?.execute(null, player);

                sayAt(player, '{red.bold Whoops, that sucked!}');

                if (hasValue(killer) && killer !== player) {
                    sayAt(player, `You were killed by ${killer.name}.`);
                }

                // player loses 20% exp gained this level on death
                const lostExp = -1 * Math.floor(player.experience * 0.2);

                player.addExperience(lostExp);
                player.save();
                sayAt(player, `{red You lose {bold ${lostExp}} experience!}`);

                prompt(player);
            });
        };
    },
};

export default evt;
