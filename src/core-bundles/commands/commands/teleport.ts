import PlayerRole from '../../../lib/players/player-role.js';
import {hasValue} from '../../../lib/util/functions.js';
import {isNpc} from '../../../lib/util/characters.js';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast.js';

import type Character from '../../../lib/characters/character.js';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import type GameStateData from '../../../lib/game-state-data.js';
import type Player from '../../../lib/players/player.js';
import type Room from '../../../lib/locations/room.js';

export const cmd: CommandDefinitionFactory = {
    name: 'teleport',
    aliases: ['tp'],
    usage: 'teleport <player/room>',
    requiredRole: PlayerRole.ADMIN,
    command: (state: GameStateData): CommandExecutable => (rawArgs: string | null, player: Player): void => {
        const args = rawArgs?.trim() ?? '';

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

        player.followers.forEach((follower: Character) => {
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
            sayAt(player, '{green.bold You snap your finger and instantly appear in a new room.}');

            state.commandManager.get('look')?.execute('', player);
        });

        if (hasValue(oldRoom)) {
            sayAt(oldRoom, `${player.name} teleported away.`);
        }

        sayAtExcept(targetRoom, `${player.name} teleported here.`, player);
    },
};

export default cmd;
