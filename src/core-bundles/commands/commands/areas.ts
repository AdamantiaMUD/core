import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type GameStateData from '../../../lib/game-state-data.js';
import PlayerRole from '../../../lib/players/player-role.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'areas',
    requiredRole: PlayerRole.ADMIN,
    command:
        (state: GameStateData): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            sayAt(player, '{red.bold Area List}');
            sayAt(player, '{red.bold ==================}');
            sayAt(player, '');

            for (const [areaRef, area] of state.areaManager.areas) {
                sayAt(player, ` * ${area.name} (${areaRef})`);
            }

            sayAt(player, `${state.areaManager.areas.size} total`);
        },
};

export default cmd;
