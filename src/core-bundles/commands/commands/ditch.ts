import ArgParser from '../../../lib/commands/arg-parser';
import {cast, hasValue} from '../../../lib/util/functions';
import {isNpc} from '../../../lib/util/characters';
import {sayAt} from '../../../lib/communication/broadcast';

import type Player from '../../../lib/players/player';
import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';

const ditch: CommandDefinitionFactory = {
    name: 'ditch',
    command: () => (rawArgs: string, player: Player): void => {
        const args = rawArgs.trim();

        if (args.length === 0) {
            sayAt(player, 'Ditch whom?');

            return;
        }

        const target = ArgParser.parseDot(args, Array.from(player.followers));

        if (!hasValue(target)) {
            sayAt(player, "They aren't following you.");

            return;
        }

        sayAt(player, `You ditch ${target.name} and they stop following you.`);

        if (!isNpc(target)) {
            sayAt(cast<Player>(target), `${player.name} ditches you and you stop following them.`);
        }

        target.unfollow();
    },
};

export default ditch;
