import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt, progress } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';
import LevelUtil from '../../../lib/util/level-util.js';

export const cmd: CommandDefinitionFactory = {
    name: 'tnl',
    aliases: ['level', 'experience'],
    usage: 'tnl',
    command:
        (): CommandExecutable =>
        (rawArgs: string | null, player: Player): void => {
            const totalTnl = LevelUtil.expToLevel(player.level + 1);
            const currentPercent = Math.floor(
                (player.experience / totalTnl) * 100
            );

            sayAt(player, `Level: ${player.level}`);
            sayAt(player, progress(80, currentPercent, 'blue'));
            sayAt(
                player,
                `${player.experience}/${totalTnl} (${currentPercent}%, ${totalTnl - player.experience} til next level)`
            );
        },
};

export default cmd;
