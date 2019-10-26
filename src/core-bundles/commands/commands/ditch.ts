import ArgParser from '../../../lib/commands/arg-parser';
import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

const ditch: CommandDefinitionFactory = {
    name: 'ditch',
    command: () => (arg: string, player: Player) => {
        if (!arg || !arg.length) {
            sayAt(player, 'Ditch whom?');

            return;
        }

        const target = ArgParser.parseDot(arg, player.followers);

        if (!target) {
            sayAt(player, "They aren't following you.");

            return;
        }

        sayAt(player, `You ditch ${target.name} and they stop following you.`);
        sayAt(target, `${player.name} ditches you and you stop following them.`);

        target.unfollow();
    },
};

export default ditch;
