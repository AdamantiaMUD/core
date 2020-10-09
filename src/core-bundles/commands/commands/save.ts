import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'save',
    usage: 'save',
    command: (): CommandExecutable => (rawArgs: string, player: Player): void => {
        player.save(() => {
            sayAt(player, 'Saved.');
        });
    },
};

export default cmd;
