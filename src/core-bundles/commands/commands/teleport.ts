import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import PlayerRole from '../../../lib/players/player-role';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt, sayAtExcept} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'teleport',
    aliases: ['tp'],
    usage: 'teleport <player/room>',
    requiredRole: PlayerRole.ADMIN,
    command: state => (args, player) => {
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

            if (!follower.isNpc) {
                sayAt(follower as Player, `You stop following ${player.name}.`);
            }
        });

        if (player.combat.isInCombat()) {
            player.combat.removeFromCombat();
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
