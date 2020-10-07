import PlayerRole from '../../../lib/players/player-role';
import {isNpc} from '../../../lib/util/characters';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'teleport',
    aliases: ['tp'],
    usage: 'teleport <player/room>',
    requiredRole: PlayerRole.ADMIN,
    command: (state): CommandExecutable => (args, player) => {
        if (!args || !args.length) {
            /* eslint-disable-next-line max-len */
            sayAt(player, 'Must specify a destination using an online player or room entity reference.');

            return;
        }

        const target = args;
        const isRoom = target.includes(':');
        let targetRoom = null;

        if (isRoom) {
            targetRoom = state.roomManager.getRoom(target);
            if (!targetRoom) {
                sayAt(player, 'No such room entity reference exists.');

                return;
            }

            if (targetRoom === player.room) {
                /* eslint-disable-next-line max-len */
                sayAt(player, "You try really hard to teleport before realizing you're already at your destination.");

                return;
            }
        }
        else {
            const targetPlayer = state.playerManager.getPlayer(target);

            if (!targetPlayer) {
                sayAt(player, 'No such player online.');

                return;
            }

            if (targetPlayer === player || targetPlayer.room === player.room) {
                /* eslint-disable-next-line max-len */
                sayAt(player, "You try really hard to teleport before realizing you're already at your destination.");

                return;
            }

            targetRoom = targetPlayer.room;
        }

        player.followers.forEach(follower => {
            follower.unfollow();

            if (!isNpc(follower)) {
                sayAt(follower as Player, `You stop following ${player.name}.`);
            }
        });

        if (player.combat.isFighting()) {
            player.combat.disengage();
        }

        const oldRoom = player.room;

        player.moveTo(targetRoom, () => {
            /* eslint-disable-next-line max-len */
            sayAt(player, '<b><green>You snap your finger and instantly appear in a new room.</green></b>\r\n');
            state.commandManager.get('look').execute('', player);
        });

        sayAt(oldRoom, `${player.name} teleported away.`);
        sayAtExcept(targetRoom, `${player.name} teleported here.`, player);
    },
};

export default cmd;
