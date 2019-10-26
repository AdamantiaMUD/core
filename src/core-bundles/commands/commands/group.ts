import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Command, {
    CommandDefinition,
    CommandDefinitionBuilder, CommandDefinitionFactory
} from '../../../lib/commands/command';
import CommandManager from '../../../lib/commands/command-manager';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';

const {center, prompt, sayAt} = Broadcast;

const createLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'create',
    command: (args, player) => {
        if (player.party) {
            sayAt(player, "You're already in a group.");

            return;
        }

        state.partyManager.create(player);
        /* eslint-disable-next-line max-len */
        sayAt(player, "<b><green>You created a group, invite players with '<white>group invite <name></white>'</green></b>");
    },
});

const inviteLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'invite',
    command: (args, player) => {
        if (!player.party) {
            sayAt(player, "You don't have a group, create one with '<b>group create</b>'.");

            return;
        }

        if (player.party && player !== player.party.leader) {
            sayAt(player, "You aren't the leader of the group.");
        }

        if (!args.length) {
            sayAt(player, 'Invite whom?');

            return;
        }

        const target = ArgParser.parseDot(args, player.room.players);

        if (target === player) {
            /* eslint-disable-next-line max-len */
            sayAt(player, 'You ask yourself if you want to join your own group. You humbly accept.');

            return;
        }

        if (!target) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (target.party) {
            sayAt(player, 'They are already in a group.');

            return;
        }

        /* eslint-disable-next-line max-len */
        sayAt(target, `<b><green>${player.name} invited you to join their group. Join/decline with '<white>group join/decline ${player.name}</white>'</green></b>`);
        sayAt(player, `<b><green>You invite ${target.name} to join your group.</green></b>`);

        player.party.invite(target);

        prompt(target);
    },
});

const disbandLoader: CommandDefinitionBuilder = (state: GameState): CommandDefinition => ({
    name: 'disband',
    command: (args, player) => {
        if (!player.party) {
            sayAt(player, "You aren't in a group.");

            return;
        }

        if (player !== player.party.leader) {
            sayAt(player, "You aren't the leader of the group.");

            return;
        }

        if (!args || args !== 'sure') {
            /* eslint-disable-next-line max-len */
            sayAt(player, "<b><green>You have to confirm disbanding your group with '<white>group disband sure</white>'</green></b>");

            return;
        }

        sayAt(player.party, '<b><green>Your group was disbanded!</green></b>');
        state.partyManager.disband(player.party);
    },
});

const joinLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'join',
    command: (args, player) => {
        if (!args.length) {
            sayAt(player, 'Join whose group?');

            return;
        }

        const target = ArgParser.parseDot(args, player.room.players);

        if (!target) {
            sayAt(player, "They aren't here.");

            return;
        }

        if (!target.party || target !== target.party.leader) {
            sayAt(player, "They aren't leading a group.");

            return;
        }

        if (!target.party.isInvited(player)) {
            sayAt(player, "They haven't invited you to join their group.");

            return;
        }

        sayAt(player, `<b><green>You join ${target.name}'s group.</green></b>`);
        sayAt(target.party, `<b><green>${player.name} joined the group.</green></b>`);
        target.party.add(player);
        player.follow(target);
    },
});

const declineLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'decline',
    command: (args, player) => {
        if (!args.length) {
            sayAt(player, 'Decline whose invite?');

            return;
        }

        const target = ArgParser.parseDot(args, player.room.players);

        if (!target) {
            sayAt(player, "They aren't here.");

            return;
        }

        sayAt(player, `<b><green>You decline to join ${target.name}'s group.</green></b>`);
        sayAt(target, `<b><green>${player.name} declined to join your group.</green></b>`);
        target.party.removeInvite(player);
    },
});

const listLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'list',
    command: (args, player) => {
        if (!player.party) {
            sayAt(player, "You're not in a group.");

            return;
        }

        sayAt(player, `<b>${center(80, 'Group', 'green', '-')}</b>`);
        for (const member of player.party) {
            let tag = '   ';

            if (member === player.party.leader) {
                tag = '[L]';
            }
            sayAt(player, `<b><green>${tag} ${member.name}</green></b>`);
        }
    },
});

const leaveLoader: CommandDefinitionBuilder = (): CommandDefinition => ({
    name: 'leave',
    command: (args, player) => {
        if (!player.party) {
            sayAt(player, "You're not in a group.");

            return;
        }

        if (player === player.party.leader) {
            sayAt(player, 'You have to disband if you want to leave the group.');

            return;
        }

        const {party} = player;

        player.party.delete(player);
        sayAt(party, `<b><green>${player.name} left the group.</green></b>`);
        sayAt(player, '<b><green>You leave the group.</green></b>');
    },
});

export const cmd: CommandDefinitionFactory = {
    name: 'group',
    aliases: ['party'],
    command: (state: GameState) => {
        const subcommands = new CommandManager();

        subcommands.add(new Command('player-groups', 'create', createLoader(state), ''));
        subcommands.add(new Command('player-groups', 'invite', inviteLoader(state), ''));
        subcommands.add(new Command('player-groups', 'disband', disbandLoader(state), ''));
        subcommands.add(new Command('player-groups', 'join', joinLoader(state), ''));
        subcommands.add(new Command('player-groups', 'decline', declineLoader(state), ''));
        subcommands.add(new Command('player-groups', 'list', listLoader(state), ''));
        subcommands.add(new Command('player-groups', 'leave', leaveLoader(state), ''));

        return (args: string, player: Player) => {
            const [command, ...commandArgs] = args.split(' ');

            let subcommand = subcommands.get('list');

            if (command) {
                subcommand = subcommands.find(command);
            }

            if (!subcommand) {
                sayAt(player, 'Not a valid party command.');

                return;
            }

            subcommand.execute(commandArgs.join(' '), player);
        };
    },
};

export default cmd;
