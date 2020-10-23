import PlayerRole from '../../../lib/players/player-role';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'debug',
    aliases: ['status', 'mudstatus'],
    requiredRole: PlayerRole.ADMIN,
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        sayAt(player, '{red.bold Mud Status}');
        sayAt(player, '{red.bold ====================}');
        sayAt(player, '');

        sayAt(player, `Area count: ${state.areaManager.areas.size}`);
        sayAt(player, `Item count: ${state.itemManager.items.size}`);
        sayAt(player, `Mob count: ${state.mobManager.mobs.size}`);
        sayAt(player, `Room count: ${state.roomManager.rooms.size}`);
    },
};

export default cmd;
