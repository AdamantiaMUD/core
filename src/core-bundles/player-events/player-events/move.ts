import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Npc from '../../../lib/mobs/npc';
import Player from '../../../lib/players/player';
import {Door} from '../../../lib/locations/room';
import {ParsedCommand} from '../../../lib/commands/command-parser';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {sayAt, sayAtExcept} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'move',
    listener: (state: GameState): PlayerEventListener => {
        /**
         * @listens Player#move
         */
        return (player: Player, movementCommand: ParsedCommand) => {
            const {payload: {roomExit}} = movementCommand;

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
                        follower.emit('move', movementCommand);
                    }
                }
            }
        };
    },
};

export default evt;
