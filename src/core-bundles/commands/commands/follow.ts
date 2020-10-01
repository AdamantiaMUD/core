import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';
import {isNpc} from '../../../lib/util/characters';

const {sayAt} = Broadcast;

const follow: CommandDefinitionFactory = {
    name: 'follow',
    command: () => (arg: string, player: Player) => {
        if (!arg || !arg.length) {
            sayAt(player, 'Follow whom?');

            return;
        }

        let target = ArgParser.parseDot(arg, player.room.players);

        if (!target) {
            if (arg === 'self') {
                target = player;
            }
            else {
                sayAt(player, "You can't find anyone named that.");

                return;
            }
        }

        // follow self un-follows the person they're currently following
        if (target === player) {
            if (player.following !== null) {
                if (!isNpc(player.following)) {
                    sayAt(player.following as Player, `${player.name} stops following you.`);
                }

                sayAt(player, `You stop following ${player.following.name}.`);

                player.unfollow();
            }
            else {
                sayAt(player, "You can't follow yourself...");
            }

            return;
        }

        sayAt(player, `You start following ${target.name}.`);
        sayAt(target, `${player.name} starts following you.`);

        player.follow(target);
    },
};

export default follow;
