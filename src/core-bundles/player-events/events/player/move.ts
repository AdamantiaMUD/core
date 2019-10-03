import Broadcast from '../../../../lib/communication/broadcast';
import GameState from '../../../../lib/game-state';
import Player from '../../../../lib/players/player';
import {PlayerEventListener} from '../../../../lib/players/player-manager';

const {sayAt, sayAtExcept} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = (state: GameState): PlayerEventListener => {
    /**
     * @listens Player#move
     */
    return (player: Player, movementCommand) => {
        const {roomExit} = movementCommand;

        if (!roomExit) {
            sayAt(player, "You can't go that way!");

            return;
        }

        const nextRoom = state.roomManager.getRoom(roomExit.roomId);
        const oldRoom = player.room;

        player.moveTo(nextRoom, () => {
            state.commandManager.get('look').execute('', player);
        });

        sayAt(oldRoom, `${player.name} leaves.`);
        sayAtExcept(nextRoom, `${player.name} enters.`, player);
    };
};

export default evt;
