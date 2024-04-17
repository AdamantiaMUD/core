import ArgParser from '../../../lib/commands/arg-parser.js';
import type CommandDefinitionBuilder from '../../../lib/commands/command-definition-builder.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandDefinition from '../../../lib/commands/command-definition.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import CommandManager from '../../../lib/commands/command-manager.js';
import Command from '../../../lib/commands/command.js';
import { center, prompt, sayAt } from '../../../lib/communication/broadcast.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import { hasValue } from '../../../lib/util/functions.js';

const createLoader: CommandDefinitionBuilder = (
    state: GameStateData
): CommandDefinition => ({
    name: 'create',
    command: (rawArgs: string | null, player: Player): void => {
        if (hasValue(player.party)) {
            sayAt(player, "You're already in a group.");

            return;
        }

        state.partyManager.create(player);

        sayAt(
            player,
            "{green.bold You created a group, invite players with '{white group invite <name>}'}"
        );
    },
});

const inviteLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'invite',
    command: (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

        if (!hasValue(player.party)) {
            sayAt(
                player,
                "You don't have a group, create one with '{bold group create}'."
            );

            return;
        }

        if (player !== player.party.leader) {
            sayAt(player, "You aren't the leader of the group.");
        }

        if (args.length === 0) {
            sayAt(player, 'Invite whom?');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(
                player,
                'You are floating in the nether, there is nobody here with you.'
            );

            return;
        }

        const target = ArgParser.parseDot(
            args,
            Array.from(player.room.players)
        );

        if (target === player) {
            sayAt(
                player,
                'You ask yourself if you want to join your own group. You humbly accept.'
            );

            return;
        }

        if (!hasValue(target)) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (hasValue(target.party)) {
            sayAt(player, 'They are already in a group.');

            return;
        }

        sayAt(
            target,
            `{green.bold ${player.name} invited you to join their group. Join/decline with '{white group join/decline ${player.name}}'}`
        );
        sayAt(
            player,
            `{green.bold You invite ${target.name} to join your group.}`
        );

        player.party.invite(target);

        prompt(target);
    },
});

const disbandLoader: CommandDefinitionBuilder = (
    state: GameStateData
): CommandDefinition => ({
    name: 'disband',
    command: (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

        if (!hasValue(player.party)) {
            sayAt(player, "You aren't in a group.");

            return;
        }

        if (player !== player.party.leader) {
            sayAt(player, "You aren't the leader of the group.");

            return;
        }

        if (args.length === 0 || args !== 'sure') {
            sayAt(
                player,
                "{green.bold You have to confirm disbanding your group with '{white group disband sure}'}"
            );

            return;
        }

        sayAt(player.party, '{green.bold Your group was disbanded!}');

        state.partyManager.disband(player.party);
    },
});

const joinLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'join',
    command: (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

        if (args.length === 0) {
            sayAt(player, 'Join whose group?');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(
                player,
                'You are floating in the nether, there is nobody here with you.'
            );

            return;
        }

        const target = ArgParser.parseDot(
            args,
            Array.from(player.room.players)
        );

        if (!hasValue(target)) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (!hasValue(target.party) || target !== target.party.leader) {
            sayAt(player, "They aren't leading a group.");

            return;
        }

        if (!target.party.isInvited(player)) {
            sayAt(player, "They haven't invited you to join their group.");

            return;
        }

        sayAt(player, `{green.bold You join ${target.name}'s group.}`);
        sayAt(target.party, `{green.bold ${player.name} joined the group.}`);

        target.party.add(player);

        player.follow(target);
    },
});

const declineLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'decline',
    command: (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

        if (args.length === 0) {
            sayAt(player, 'Decline whose invite?');

            return;
        }

        if (!hasValue(player.room)) {
            sayAt(
                player,
                'You are floating in the nether, there is nobody here with you.'
            );

            return;
        }

        const target = ArgParser.parseDot(
            args,
            Array.from(player.room.players)
        );

        if (!hasValue(target)) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (!hasValue(target.party) || target !== target.party.leader) {
            sayAt(player, "They aren't leading a group.");

            return;
        }

        sayAt(
            player,
            `{green.bold You decline to join ${target.name}'s group.}`
        );
        sayAt(
            target,
            `{green.bold ${player.name} declined to join your group.}`
        );

        target.party.removeInvite(player);
    },
});

const listLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'list',
    command: (rawArgs: string | null, player: Player): void => {
        if (!hasValue(player.party)) {
            sayAt(player, "You're not in a group.");

            return;
        }

        sayAt(player, `{bold ${center(80, 'Group', 'green', '-')}}`);

        for (const member of player.party) {
            let tag = '   ';

            if (member === player.party.leader) {
                tag = '[L]';
            }

            sayAt(player, `{green.bold ${tag} ${member.name}}`);
        }
    },
});

const leaveLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'leave',
    command: (rawArgs: string | null, player: Player): void => {
        if (!hasValue(player.party)) {
            sayAt(player, "You're not in a group.");

            return;
        }

        if (player === player.party.leader) {
            sayAt(
                player,
                'You have to disband if you want to leave the group.'
            );

            return;
        }

        const { party } = player;

        player.party.delete(player);

        sayAt(party, `{green.bold ${player.name} left the group.}`);
        sayAt(player, '{green.bold You leave the group.}');
    },
});

export const cmd: CommandDefinitionFactory = {
    name: 'group',
    aliases: ['party'],
    command: (state: GameStateData): CommandExecutable => {
        const subcommands = new CommandManager();

        subcommands.add(
            new Command('player-groups', 'create', createLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'invite', inviteLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'disband', disbandLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'join', joinLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'decline', declineLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'list', listLoader(state), '')
        );
        subcommands.add(
            new Command('player-groups', 'leave', leaveLoader(state), '')
        );

        return (rawArgs: string | null, player: Player): void => {
            const args = rawArgs?.trim() ?? '';

            const [command, ...commandArgs] = args.split(' ');

            let subcommand = subcommands.get('list');

            if (hasValue(command)) {
                subcommand = subcommands.find(command);
            }

            if (!hasValue(subcommand)) {
                sayAt(player, 'Not a valid party command.');

                return;
            }

            subcommand.execute(commandArgs.join(' '), player);
        };
    },
};

export default cmd;
