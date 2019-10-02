import Broadcast from '../../../lib/communication/broadcast';
import LevelUtil from '../../../lib/util/level-util';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {progress, sayAt} = Broadcast;

export const cmd: CommandDefinitionFactory = {
    name: 'tnl',
    aliases: ['level', 'experience'],
    usage: 'tnl',
    command: () => (args, player) => {
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
