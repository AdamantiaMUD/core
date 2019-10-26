import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/entities/character';
import Heal from '../../../lib/combat/heal';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'heal',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#heal
         */
        return (player: Player, heal: Heal, target: Character, finalAmount: number) => {
            if (heal.metadata.hidden) {
                return;
            }

            if (target !== player) {
                let buf = '';

                if (heal.source === player) {
                    buf = 'You heal';
                }
                else {
                    buf = `Your <b>${heal.source.name}</b> healed`;
                }

                /* eslint-disable-next-line max-len */
                buf += `<b> ${target.name}</b> for <b><green>${finalAmount}</green></b> ${heal.attribute}.`;
                sayAt(player, buf);
            }

            // show heals to party members
            if (!player.party) {
                return;
            }

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    let buf = '';

                    if (heal.source === player) {
                        buf = `${player.name} healed`;
                    }
                    else {
                        buf = `${player.name} <b>${heal.source.name}</b> healed`;
                    }

                    buf += ` <b>${target.name}</b>`;
                    buf += ` for <b><green>${finalAmount}</green></b> ${heal.attribute}.`;
                    sayAt(member, buf);
                }
            }
        };
    },
};

export default evt;
