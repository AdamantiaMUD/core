import LevelUtil from '../../../lib/util/level-util';
import {sayAt, progress} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'tnl',
    aliases: ['level', 'experience'],
    usage: 'tnl',
    command: (): CommandExecutable => (args: string, player: Player) => {
        const totalTnl = LevelUtil.expToLevel(player.level + 1);
        const currentPercent = player.experience
            ? Math.floor((player.experience / totalTnl) * 100)
            : 0;

        sayAt(player, `Level: ${player.level}`);
        sayAt(player, progress(80, currentPercent, 'blue'));
        /* eslint-disable-next-line max-len */
        sayAt(player, `${player.experience}/${totalTnl} (${currentPercent}%, ${totalTnl - player.experience} til next level)`);
    },
};

export default cmd;
