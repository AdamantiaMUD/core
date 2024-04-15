import CommandParser from '../../../lib/commands/command-parser.js';
import random from '../../../lib/util/random.js';
import {PlayerMoveEvent} from '../../../lib/players/events/index.js';
import {hasValue} from '../../../lib/util/functions.js';
import {sayAt} from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type RoomExitDefinition from '../../../lib/locations/room-exit-definition.js';

export const cmd: CommandDefinitionFactory = {
    name: 'flee',
    usage: 'flee [direction]',
    command: (state: GameStateData): CommandExecutable => (rawArgs: string | null, player: Player): void => {
        const direction = rawArgs?.trim() ?? '';

        if (!player.combat.isFighting()) {
            sayAt(player, 'You jump at the sight of your own shadow.');

            return;
        }

        if (!hasValue(player.room)) {
            // @TODO: throw?
            return;
        }

        let roomExit: RoomExitDefinition | null;

        if (hasValue(direction) && direction !== '') {
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
