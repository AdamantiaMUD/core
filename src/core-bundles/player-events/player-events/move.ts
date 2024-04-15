import {PlayerMoveEvent} from '../../../lib/players/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';
import {isNpc} from '../../../lib/util/characters.js';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast.js';

import type Door from '../../../lib/locations/door.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type PlayerEventListener from '../../../lib/events/player-event-listener.js';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition.js';
import type {PlayerMovePayload} from '../../../lib/players/events/index.js';

export const evt: PlayerEventListenerDefinition<PlayerMovePayload> = {
    name: PlayerMoveEvent.getName(),
    listener: (state: GameStateData): PlayerEventListener<PlayerMovePayload> => (
        player: Player,
        {roomExit}: PlayerMovePayload
    ): void => {
        if (!hasValue(roomExit)) {
            sayAt(player, "You can't go that way!");

            return;
        }

        if (!hasValue(player.room)) {
            // @TODO: invalid state; error?
            sayAt(player, 'Where are you? You have to be somewhere before you can go anywhere!');

            return;
        }

        if (player.combat.isFighting()) {
            sayAt(player, 'You are in the middle of a fight!');

            return;
        }

        const nextRoom = state.roomManager.getRoom(roomExit.roomId);
        const oldRoom = player.room;

        const door: Door | null = oldRoom.getDoor(nextRoom) ?? nextRoom?.getDoor(oldRoom) ?? null;

        if (hasValue(door)) {
            if (door.locked) {
                sayAt(player, 'The door is locked.');

                return;
            }

            if (door.closed) {
                sayAt(player, 'The door is closed.');

                return;
            }
        }

        player.moveTo(nextRoom!, (): void => {
            state.commandManager.get('look')?.execute('', player);
        });

        sayAt(oldRoom, `${player.name} leaves.`);
        sayAtExcept(nextRoom!, `${player.name} enters.`, player);

        for (const follower of player.followers) {
            if (!(follower.room !== oldRoom)) {
                if (isNpc(follower)) {
                    follower.moveTo(nextRoom!);
                }
                else {
                    sayAt(
                        follower as Player,
                        `You follow ${player.name} to ${nextRoom!.title}.`
                    );
                    follower.dispatch(new PlayerMoveEvent({roomExit}));
                }
            }
        }
    },
};

export default evt;
