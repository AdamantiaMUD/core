import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/entities/character';
import LevelUtil from '../../../lib/util/level-util';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'deathblow',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#deathblow
         */
        return (player: Player, target: Character, skipParty: boolean = false) => {
            /* eslint-disable-next-line id-length */
            const xp = LevelUtil.mobExp(target.level);

            if (player.party && !skipParty) {
                /*
                 * If they're in a party, proxy the deathblow to all members of
                 * the party in the same room. this will make sure party members
                 * get quest credit trigger anything else listening for
                 * deathblow
                 */
                for (const member of player.party) {
                    if (member.room === player.room) {
                        member.emit('deathblow', target, true);
                    }
                }

                return;
            }

            if (target && !player.isNpc) {
                sayAt(player, `<b><red>You killed ${target.name}!</red></b>`);
            }

            player.emit('experience', xp);
        };
    },
};

export default evt;
