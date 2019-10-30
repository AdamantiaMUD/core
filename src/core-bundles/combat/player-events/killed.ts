import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/characters/character';
import GameState from '../../../lib/game-state';
import Logger from '../../../lib/util/logger';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {prompt, sayAt, sayAtExcept} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'killed',
    listener: (state: GameState): PlayerEventListener => {
        const startingRoomRef = state.config.get('startingRoom');

        if (!startingRoomRef) {
            Logger.error('No startingRoom defined in ranvier.json');
        }

        /**
         * @listens Player#killed
         */
        return (player: Player, killer?: Character) => {
            player.removePrompt('combat');

            const othersDeathMessage = killer
                /* eslint-disable-next-line max-len */
                ? `<b><red>${player.name} collapses to the ground, dead at the hands of ${killer.name}.</b></red>`
                : `<b><red>${player.name} collapses to the ground, dead</b></red>`;

            sayAtExcept(
                player.room,
                othersDeathMessage,
                killer && !killer.isNpc
                    ? [killer as Player, player]
                    : player
            );

            if (player.party) {
                sayAt(player.party, `<b><green>${player.name} was killed!</green></b>`);
            }

            player.resetAttribute('hp');

            let home = state.roomManager.getRoom(player.getMeta('waypoint.home'));

            if (!home) {
                home = state.roomManager.getRoom(startingRoomRef);
            }

            player.moveTo(home, () => {
                state.commandManager.get('look').execute(null, player);

                sayAt(player, '<b><red>Whoops, that sucked!</red></b>');
                if (killer && killer !== player) {
                    sayAt(player, `You were killed by ${killer.name}.`);
                }

                // player loses 20% exp gained this level on death
                const lostExp = -1 * Math.floor(player.experience * 0.2);

                player.addExperience(lostExp);
                player.save();
                sayAt(player, `<red>You lose <b>${lostExp}</b> experience!</red>`);

                prompt(player);
            });
        };
    },
};

export default evt;
