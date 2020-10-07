/* eslint-disable no-process-exit */
import PlayerRole from '../../../lib/players/player-role';
import {sayAt} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

/**
 * Shut down the MUD from within the game.
 */
export const cmd: CommandDefinitionFactory = {
    name: 'shutdown',
    requiredRole: PlayerRole.ADMIN,
    command: (state): CommandExecutable => async (time, player) => {
        if (time === 'now') {
            sayAt(state.playerManager, '<b><yellow>Game is shutting down now!</yellow></b>');
            await state.playerManager.saveAll();

            process.exit();

            return;
        }

        if (!time.length || time !== 'sure') {
            /* eslint-disable-next-line max-len */
            sayAt(player, 'You must confirm the shutdown with "shutdown sure" or force immediate shutdown with "shutdown now"');

            return;
        }

        sayAt(state.playerManager, '<b><yellow>Game will shut down in 30 seconds.</yellow></b>');

        setTimeout(async () => {
            sayAt(state.playerManager, '<b><yellow>Game is shutting down now!</yellow></b>');

            await state.playerManager.saveAll();

            process.exit();
        }, 30000);
    },
};

export default cmd;
