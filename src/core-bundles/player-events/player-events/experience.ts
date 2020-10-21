import LevelUtil from '../../../lib/util/level-util';
import {PlayerExperienceEvent, PlayerLevelUpEvent} from '../../../lib/players/events';
import {progress, sayAt} from '../../../lib/communication/broadcast';

import type Player from '../../../lib/players/player';
import type PlayerEventListener from '../../../lib/events/player-event-listener';
import type PlayerEventListenerDefinition from '../../../lib/events/player-event-listener-definition';
import type {PlayerExperiencePayload} from '../../../lib/players/events';

export const evt: PlayerEventListenerDefinition<PlayerExperiencePayload> = {
    name: PlayerExperienceEvent.getName(),
    listener: (): PlayerEventListener<PlayerExperiencePayload> => (
        player: Player,
        {amount}: PlayerExperiencePayload
    ): void => {
        sayAt(player, `{blue You gained {bold ${amount}} experience!}`);

        const totalTnl = LevelUtil.expToLevel(player.level + 1);

        let amt = amount;

        /*
         * level up, currently wraps experience if they gain more than
         * needed for multiple levels
         */
        if (player.experience + amt > totalTnl) {
            sayAt(player, '                                   {blue.bold !Level Up!}');
            sayAt(player, progress(80, 100, 'blue'));

            let nextTnl = totalTnl;

            while (player.experience + amt > nextTnl) {
                amt = (player.experience + amt) - nextTnl;
                player.levelUp();
                nextTnl = LevelUtil.expToLevel(player.level + 1);
                sayAt(player, `{blue You are now level {bold ${player.level}}!}`);
                player.dispatch(new PlayerLevelUpEvent());
            }
        }

        player.addExperience(amt);

        player.save();
    },
};

export default evt;
