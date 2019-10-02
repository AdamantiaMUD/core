import Broadcast from '../../../lib/communication/broadcast';
import {CommandDefinitionFactory} from '../../../lib/commands/command';

const {sayAt} = Broadcast;

/* eslint-disable array-element-newline */
const getRoleString = (role: number = 0): string => [
    '',
    '<white>[Builder]</white>',
    '<b><white>[Admin]</white></b>',
][role] || '';
/* eslint-enable array-element-newline */

export const cmd: CommandDefinitionFactory = {
    name: 'who',
    usage: 'who',
    command: state => (args, player) => {
        sayAt(player, "<b><red>                  Who's Online</b></red>");
        sayAt(player, '<b><red>===============================================</b></red>');
        sayAt(player, '');

        state.playerManager.players.forEach(otherPlayer => {
            sayAt(player, ` *  ${otherPlayer.name} ${getRoleString(otherPlayer.role)}`);
        });

        sayAt(player, `${state.playerManager.players.size} total`);
    },
};

export default cmd;
