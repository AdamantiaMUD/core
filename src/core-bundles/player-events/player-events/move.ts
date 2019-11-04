import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {Door} from '../../../lib/locations/room';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';
import {PlayerMoveEvent, PlayerMovePayload} from '../../../lib/players/player-events';

const {sayAt, sayAtExcept} = Broadcast;

export const evt: MudEventListenerFactory<PlayerMovePayload> = {
    name: PlayerMoveEvent.getName(),
    listener: (state: GameState): MudEventListener<PlayerMovePayload> => {
        return (player: Player, {cmd}) => {
            const {payload: {roomExit}} = cmd;

            if (!roomExit) {
                sayAt(player, "You can't go that way!");

                return;
            }

            if (player.combat.isFighting()) {
                sayAt(player, 'You are in the middle of a fight!');

                return;
            }

            const nextRoom = state.roomManager.getRoom(roomExit.roomId);
            const oldRoom = player.room;

            const door: Door = oldRoom.getDoor(nextRoom) ?? nextRoom.getDoor(oldRoom);

            if (door) {
                if (door.locked) {
                    sayAt(player, 'The door is locked.');

                    return;
                }

                if (door.closed) {
                    sayAt(player, 'The door is closed.');

                    return;
                }
            }

            player.moveTo(nextRoom, (): void => {
                state.commandManager.get('look').execute('', player);
            });

            sayAt(oldRoom, `${player.name} leaves.`);
            sayAtExcept(nextRoom, `${player.name} enters.`, player);

            for (const follower of player.followers) {
                if (!(follower.room !== oldRoom)) {
                    if (follower.isNpc()) {
                        follower.moveTo(nextRoom);
                    }
                    else {
                        sayAt(follower as Player, `\r\nYou follow ${player.name} to ${nextRoom.title}.`);
                        follower.dispatch(new PlayerMoveEvent({cmd}));
                    }
                }
            }
        };
    },
};

export default evt;
