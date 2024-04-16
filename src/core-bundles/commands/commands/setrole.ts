import ArgParser from '../../../lib/commands/arg-parser.js';
import PlayerRole from '../../../lib/players/player-role.js';
import { hasValue } from '../../../lib/util/functions.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'setrole',
    requiredRole: PlayerRole.ADMIN,
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            if (args.length === 0) {
                sayAt(player, 'setrole <player> <role>');

                return;
            }

            const parts = args.split(' ');

            if (parts.length < 2) {
                sayAt(player, 'What role do you want to give them?');

                return;
            }

            let role: PlayerRole;

            if (typeof parts[1] === 'string') {
                role =
                    PlayerRole[
                        parts[1].toUpperCase() as keyof typeof PlayerRole
                    ];
            } else {
                role =
                    PlayerRole[
                        PlayerRole[Number(parts[1])] as keyof typeof PlayerRole
                    ];
            }

            if (!hasValue(role)) {
                sayAt(player, 'That is not a valid role.');

                return;
            }

            const target: Player | null = ArgParser.parseDot(
                args,
                Array.from(player.room?.players ?? [])
            );

            if (!hasValue(target)) {
                sayAt(player, 'They are not here.');

                return;
            }

            if (target.role === role) {
                sayAt(player, 'They already have that role.');

                return;
            }

            const didAssign = target.setRole(role, player);

            if (didAssign) {
                sayAt(
                    target,
                    `Your role has been set to ${role} by ${player.name}.`
                );
                sayAt(player, `${target.name} has been given role ${role}.`);
            }
        },
};

export default cmd;
