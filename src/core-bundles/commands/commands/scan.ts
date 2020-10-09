import {at, sayAt} from '../../../lib/communication/broadcast';
import {hasValue} from '../../../lib/util/functions';

import type CommandDefinitionFactory from '../../../lib/commands/command-definition-factory';
import type CommandExecutable from '../../../lib/commands/command-executable';
import type GameStateData from '../../../lib/game-state-data';
import type Player from '../../../lib/players/player';

/**
 * See brief details of npcs/players in nearby rooms
 */
export const cmd: CommandDefinitionFactory = {
    name: 'scan',
    usage: 'scan',
    command: (state: GameStateData): CommandExecutable => (args: string, player: Player): void => {
        if (!hasValue(player.room)) {
            // @TODO: throw
            return;
        }

        for (const exit of player.room.exits) {
            const room = state.roomManager.getRoom(exit.roomId);

            at(player, `(${exit.direction}) ${room.title}`);
            if (room.npcs.size > 0 || room.players.size > 0) {
                sayAt(player, ':');
            }
            else {
                sayAt(player);
            }

            for (const npc of room.npcs) {
                sayAt(player, `  [NPC] ${npc.name}`);
            }

            /* eslint-disable-next-line id-length */
            for (const pc of room.players) {
                sayAt(player, `  [NPC] ${pc.name}`);
            }

            sayAt(player);
        }
    },
};

export default cmd;
