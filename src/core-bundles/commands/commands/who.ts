import {sayAt, sayAtColumns} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

/* eslint-disable array-element-newline */
const getRoleString = (role: number = 0): string => [
    '',
    '<white>[Builder]</white>',
    '<b><white>[Admin]</white></b>',
][role] || '';
/* eslint-enable array-element-newline */

export const cmd: CommandDefinitionFactory = {
    name: 'who',
    usage: 'who',
    command: (state): CommandExecutable => (args, player) => {
        sayAt(player, "<b><red>                  Who's Online</b></red>");
        sayAt(player, '<b><red>===============================================</b></red>');
        sayAt(player, '');

        state.playerManager.players.forEach(otherPlayer => {
            sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
        });

        sayAt(player, `${state.playerManager.players.size} total`);
    },
};

export default cmd;
