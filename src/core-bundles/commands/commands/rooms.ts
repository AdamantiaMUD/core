import PlayerRole from '../../../lib/players/player-role.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'rooms',
    requiredRole: PlayerRole.ADMIN,
    command:
        (state: GameStateData): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            sayAt(player, '{red.bold                   Room List}');
            sayAt(
                player,
                '{red.bold ===============================================}'
            );
            sayAt(player, '');

            for (const [roomRef, room] of state.roomManager.rooms) {
                sayAt(player, ` * ${room.name} (${roomRef})`);
            }

            sayAt(player, `${state.roomManager.rooms.size} total`);
        },
};

export default cmd;
