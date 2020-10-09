import {hasValue} from '../../../lib/util/functions';
import {sayAt, sayAtExcept} from '../../../lib/communication/broadcast';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

export const cmd: CommandDefinitionFactory = {
    name: 'quit',
    usage: 'quit',
    command: (state: GameStateData): CommandExecutable => (rawArgs: string, player: Player): void => {
        if (player.combat.isFighting()) {
            sayAt(player, "You're too busy fighting for your life!");

            return;
        }

        player.save(() => {
            sayAt(player, 'Goodbye!');

            if (hasValue(player.room)) {
                sayAtExcept(player.room, `${player.name} disappears.`, player);
            }

            state.playerManager.removePlayer(player, true);
        });
    },
};

export default cmd;
