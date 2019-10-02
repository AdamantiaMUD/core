import Broadcast from '../../../lib/communication/broadcast';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

/**
 * See brief details of npcs/players in nearby rooms
 */
export const cmd: CommandDefinitionFactory = {
    name: 'scan',
    usage: 'scan',
    command: state => (args, player) => {
        for (const exit of player.room.exits) {
            const room = state.roomManager.getRoom(exit.roomId);

            Broadcast.at(player, `(${exit.direction}) ${room.title}`);
            if (room.npcs.size || room.players.size) {
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
