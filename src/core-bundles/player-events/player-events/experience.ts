import Broadcast from '../../../lib/communication/broadcast';
import LevelUtil from '../../../lib/util/level-util';
import Player from '../../../lib/players/player';
import {PlayerEventListener, PlayerEventListenerFactory} from '../../../lib/events/player-events';

const {progress, sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'experience',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#experience
         */
        return (player: Player, amount: number) => {
            sayAt(player, `<blue>You gained <b>${amount}</b> experience!</blue>`);

            const totalTnl = LevelUtil.expToLevel(player.level + 1);

            let amt = amount;

            /*
             * level up, currently wraps experience if they gain more than
             * needed for multiple levels
             */
            if (player.experience + amt > totalTnl) {
                /* eslint-disable-next-line max-len */
                sayAt(player, '                                   <b><blue>!Level Up!</blue></b>');
                sayAt(player, progress(80, 100, 'blue'));

                let nextTnl = totalTnl;

                while (player.experience + amt > nextTnl) {
                    amt = (player.experience + amt) - nextTnl;
                    player.levelUp();
                    nextTnl = LevelUtil.expToLevel(player.level + 1);
                    sayAt(player, `<blue>You are now level <b>${player.level}</b>!</blue>`);
                    player.emit('level');
                }
            }

            player.addExperience(amt);

            player.save();
        };
    },
};

export default evt;
