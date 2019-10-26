import Heal from '../../../lib/combat/heal';
import Broadcast from '../../../lib/communication/broadcast';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';
import Player from '../../../lib/players/player';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'healed',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#healed
         */
        return (player: Player, heal: Heal, finalAmount: number) => {
            if (heal.metadata.hidden) {
                return;
            }

            let buf = '',
                attacker = '',
                source = '';

            if (heal.attacker && heal.attacker !== player) {
                attacker = `<b>${heal.attacker.name}</b> `;
            }

            if (heal.source !== heal.attacker) {
                attacker = attacker ? `${attacker}'s ` : '';
                source = `<b>${heal.source.name}</b>`;
            }
            else if (!heal.attacker) {
                source = 'Something';
            }

            if (heal.attribute === 'hp') {
                buf = `${attacker}${source} heals you for <b><red>${finalAmount}</red></b>.`;
            }
            else {
                buf = `${attacker}${source} restores <b>${finalAmount}</b> ${heal.attribute}.`;
            }
            sayAt(player, buf);

            // show heal to party members only if it's to hp and not restoring a different pool
            if (!player.party || heal.attribute !== 'hp') {
                return;
            }

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    /* eslint-disable-next-line max-len */
                    buf = `${attacker}${source} heals ${player.name} for <b><red>${finalAmount}</red></b>.`;

                    sayAt(member, buf);
                }
            }
        };
    },
};

export default evt;
