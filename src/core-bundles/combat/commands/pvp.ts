import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory.js';
import type CommandExecutable from '../../../lib/commands/command-executable.js';
import { sayAt } from '../../../lib/communication/broadcast.js';
import type Player from '../../../lib/players/player.js';

export const cmd: CommandDefinitionFactory = {
    name: 'pvp',
    command:
        (): CommandExecutable =>
        (args: string | null, player: Player): void => {
            const wasPvp = player.getMeta<boolean>('pvp') ?? false;
            const isPvp = !wasPvp;

            player.setMeta<boolean>('pvp', isPvp);

            const message = isPvp
                ? 'You are now able to enter into player-on-player duels.'
                : 'You are now a pacifist and cannot enter player-on-player duels.';

            sayAt(player, message);
        },
};

export default cmd;
