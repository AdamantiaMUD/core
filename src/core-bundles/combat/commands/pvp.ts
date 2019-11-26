import Player from '~/lib/players/player';
import {CommandDefinitionFactory} from '~/lib/commands/command';
import {sayAt} from '~/lib/communication/broadcast';

export const cmd: CommandDefinitionFactory = {
    name: 'pvp',
    command: () => (args: string, player: Player) => {
        const previousPvpSetting = player.getMeta('pvp') || false;
        const newPvpSetting = !previousPvpSetting;

        player.setMeta('pvp', newPvpSetting);

        const message = newPvpSetting
            ? 'You are now able to enter into player-on-player duels.'
            : 'You are now a pacifist and cannot enter player-on-player duels.';

        sayAt(player, message);
    },
};

export default cmd;
