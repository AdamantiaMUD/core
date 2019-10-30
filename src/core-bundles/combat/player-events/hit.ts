import Broadcast from '../../../lib/communication/broadcast';
import Character from '../../../lib/characters/character';
import Damage from '../../../lib/combat/damage';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'hit',
    listener: (): PlayerEventListener => {
        /**
         * @listens Player#hit
         */
        return (player: Player, damage: Damage, target: Character, finalAmount: number) => {
            if (damage.metadata.hidden) {
                return;
            }

            let buf = '';

            if (damage.source === player) {
                buf = 'You hit';
            }
            else {
                buf = `Your <b>${damage.source.name}</b> hit`;
            }

            buf += ` <b>${target.name}</b> for <b>${finalAmount}</b> damage.`;

            if (damage.metadata.critical) {
                buf += ' <red><b>(Critical)</b></red>';
            }

            sayAt(player, buf);

            if (player.equipment.has('wield')) {
                player.equipment.get('wield').emit('hit', damage, target, finalAmount);
            }

            // show damage to party members
            if (!player.party) {
                return;
            }

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    buf = '';

                    if (damage.source === player) {
                        buf = `${player.name} hit`;
                    }
                    else {
                        buf = `${player.name} <b>${damage.source.name}</b> hit`;
                    }

                    buf += ` <b>${target.name}</b> for <b>${finalAmount}</b> damage.`;
                    sayAt(member, buf);
                }
            }
        };
    },
};

export default evt;
