import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

const getRoleString = (role: number = 0): string => [
    '',
    '{white [Builder]}',
    '{white.bold [Admin]}',
][role] ?? '';

export const cmd: CommandDefinitionFactory = {
    name: 'who',
    usage: 'who',
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        sayAt(player, "{red.bold                   Who's Online}");
        sayAt(player, '{red.bold ===============================================}');
        sayAt(player, '');

        state.playerManager.players.forEach((otherPlayer: Player) => {
            sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
        });

        sayAt(player, `${state.playerManager.players.size} total`);
    },
};

export default cmd;
