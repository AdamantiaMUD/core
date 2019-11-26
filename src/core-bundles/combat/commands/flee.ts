import {Random} from 'rando-js';

import CommandParser from '~/lib/commands/command-parser';
import Player from '~/lib/players/player';
import {CommandDefinitionFactory} from '~/lib/commands/command';
import {PlayerMoveEvent} from '~/lib/players/player-events';
import {sayAt} from '~/lib/communication/broadcast';

export const cmd: CommandDefinitionFactory = {
    name: 'flee',
    usage: 'flee [direction]',
    command: state => (direction, player: Player) => {
        if (!player.combat.isFighting()) {
            sayAt(player, 'You jump at the sight of your own shadow.');

            return;
        }

        let roomExit = null;

        if (direction) {
            roomExit = CommandParser.canGo(player, direction);
        }
        else {
            roomExit = Random.fromArray(player.room.getExits());
        }

        const randomRoom = state.roomManager.getRoom(roomExit.roomId);

        if (!randomRoom) {
            sayAt(player, "You can't find anywhere to run!");

            return;
        }

        const door = player.room.getDoor(randomRoom) || randomRoom.getDoor(player.room);

        if (randomRoom && door && (door.locked || door.closed)) {
            sayAt(player, 'In your panic you run into a closed door!');

            return;
        }

        sayAt(player, 'You cowardly flee from the battle!');
        player.combat.disengage();
        player.dispatch(new PlayerMoveEvent({roomExit}));
    },
};

export default cmd;
