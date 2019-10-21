import Broadcast from '../../../lib/communication/broadcast';
import Logger from '../../../lib/util/logger';
import Player from '../../../lib/players/player';
import PlayerRole from '../../../lib/players/player-role';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'where',
    requiredRole: PlayerRole.BUILDER,
    command: () => (args, player: Player) => {
        if (!player.room) {
            Logger.error(`${player.name} is in limbo.`);

            sayAt(player, 'You are in a deep, dark void.');

            return;
        }

        sayAt(player, player.room.entityReference);
    },
};

export default cmd;
