import Logger from '../../../lib/common/logger';
import PlayerRole from '../../../lib/players/player-role';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

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
