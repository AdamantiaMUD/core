import CommandParser from '../../../lib/commands/command-parser';
import random from '../../../lib/util/random';
import {PlayerMoveEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type {RoomExitDefinition} from '../../../lib/locations/room';

export const cmd: CommandDefinitionFactory = {
    name: 'flee',
    usage: 'flee [direction]',
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const direction = rawArgs.trim();

        if (!player.combat.isFighting()) {
            sayAt(player, 'You jump at the sight of your own shadow.');

            return;
        }

        if (!hasValue(player.room)) {
            // @TODO: throw?
            return;
        }

        let roomExit: RoomExitDefinition | null;

        if (hasValue(direction)) {
            roomExit = CommandParser.canGo(player, direction);
        }
        else {
            roomExit = random.pickone(player.room.getExits());
        }

        const randomRoom = hasValue(roomExit) ? state.roomManager.getRoom(roomExit.roomId) : null;

        if (!hasValue(randomRoom)) {
            sayAt(player, "You can't find anywhere to run!");

            return;
        }

        const door = player.room.getDoor(randomRoom) ?? randomRoom.getDoor(player.room);

        if (hasValue(door) && (door.locked || door.closed)) {
            sayAt(player, 'In your panic you run into a closed door!');

            return;
        }

        sayAt(player, 'You cowardly flee from the battle!');
        player.combat.disengage();
        player.dispatch(new PlayerMoveEvent({roomExit: roomExit!}));
    },
};

export default cmd;
