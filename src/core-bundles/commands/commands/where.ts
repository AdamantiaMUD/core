import Logger from '../../../lib/common/logger.js';
import PlayerRole from '../../../lib/players/player-role.js';
import {hasValue} from '../../../lib/util/functions.js';
import {sayAt} from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'where',
    requiredRole: PlayerRole.BUILDER,
    command: (): CommandExecutable => (rawArgs: string | null, player: Player): void => {
        if (!hasValue(player.room)) {
            Logger.error(`${player.name} is in limbo.`);

            sayAt(player, 'You are in a deep, dark void.');

            return;
        }

        sayAt(player, player.room.entityReference);
    },
};

export default cmd;
