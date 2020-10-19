import PlayerRole from '../../../lib/players/player-role';
import {hasValue} from '../../../lib/util/functions';
import {isNpc} from '../../../lib/util/characters';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast';

import type CharacterInterface from '../../../lib/characters/character-interface';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';
import type Room from '../../../lib/locations/room';

export const cmd: CommandDefinitionFactory = {
    name: 'teleport',
    aliases: ['tp'],
    usage: 'teleport <player/room>',
    requiredRole: PlayerRole.ADMIN,
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Must specify a destination using an online player or room entity reference.');

            return;
        }

        const target = args;
        const isRoom = target.includes(':');
        let targetRoom: Room | null;

        if (isRoom) {
            targetRoom = state.roomManager.getRoom(target);

            if (!hasValue(targetRoom)) {
                sayAt(player, 'No such room entity reference exists.');

                return;
            }

            if (targetRoom === player.room) {
                sayAt(player, "You try really hard to teleport before realizing you're already at your destination.");

                return;
            }
        }
        else {
            const targetPlayer = state.playerManager.getPlayer(target);

            if (!hasValue(targetPlayer)) {
                sayAt(player, 'No such player online.');

                return;
            }

            if (targetPlayer === player || targetPlayer.room === player.room) {
                sayAt(player, "You try really hard to teleport before realizing you're already at your destination.");

                return;
            }

            targetRoom = targetPlayer.room;
        }

        if (!hasValue(targetRoom)) {
            sayAt(player, "You try really hard to teleport before realizing you have no idea where you're going.");

            return;
        }

        player.followers.forEach((follower: CharacterInterface) => {
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
            sayAt(player, '<b><green>You snap your finger and instantly appear in a new room.</green></b>\r\n');

            state.commandManager.get('look')?.execute('', player);
        });

        if (hasValue(oldRoom)) {
            sayAt(oldRoom, `${player.name} teleported away.`);
        }

        sayAtExcept(targetRoom, `${player.name} teleported here.`, player);
    },
};

export default cmd;
