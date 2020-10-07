import Logger from '../../../lib/util/logger';
import PlayerRole from '../../../lib/players/player-role';
import {sayAt, sayAtColumns} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'where',
    requiredRole: PlayerRole.BUILDER,
    command: (): CommandExecutable => (args, player: Player) => {
        if (!player.room) {
            Logger.error(`${player.name} is in limbo.`);

            sayAt(player, 'You are in a deep, dark void.');

            return;
        }

        sayAt(player, player.room.entityReference);
    },
};

export default cmd;
