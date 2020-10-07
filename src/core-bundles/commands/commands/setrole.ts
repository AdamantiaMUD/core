import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import PlayerRole from '../../../lib/players/player-role';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type Player from '../../../lib/players/player';

const {sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'setrole',
    requiredRole: PlayerRole.ADMIN,
    command: (): CommandExecutable => (rawArgs: string, player: Player) => {
        const args = rawArgs.trim();

        if (!args.length) {
            sayAt(player, 'setrole <player> <role>');

            return;
        }

        const parts = args.split(' ');

        if (parts.length < 2) {
            sayAt(player, 'What role do you want to give them?');

            return;
        }

        let role: PlayerRole = null;

        if (typeof parts[1] === 'string') {
            role = PlayerRole[parts[1].toUpperCase()];
        }
        else {
            role = PlayerRole[PlayerRole[parts[1]]];
        }

        if (role === null || role === undefined) {
            sayAt(player, 'That is not a valid role.');

            return;
        }

        const target: Player = ArgParser.parseDot(args, player.room.players);

        if (!target) {
            sayAt(player, 'They are not here.');

            return;
        }

        if (target.role === role) {
            sayAt(player, 'They already have that role.');

            return;
        }

        const result = target.setRole(role, player);

        if (result) {
            sayAt(target, `Your role has been set to ${role} by ${player.name}.`);
            sayAt(player, `${target.name} has been given role ${role}.`);
        }
    },
};

export default cmd;
