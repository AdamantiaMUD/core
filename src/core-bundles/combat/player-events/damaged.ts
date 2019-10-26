import Broadcast from '../../../lib/communication/broadcast';
import Damage from '../../../lib/combat/damage';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {
    PlayerEventListener,
    PlayerEventListenerFactory
} from '../../../lib/events/player-events';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: PlayerEventListenerFactory = {
    name: 'damaged',
    listener: (state: GameState): PlayerEventListener => {
        /**
         * @listens Player#damaged
         */
        return (player: Player, damage: Damage, finalAmount: number) => {
            if (damage.metadata.hidden || damage.attribute !== 'hp') {
                return;
            }

            let buf = '';

            if (damage.attacker) {
                buf = `<b>${damage.attacker.name}</b>`;
            }

            if (damage.source !== damage.attacker) {
                buf += `${damage.attacker ? "'s " : ' '}<b>${damage.source.name}</b>`;
            }
            else if (!damage.attacker) {
                buf += 'Something';
            }

            buf += ` hit <b>you</b> for <b><red>${finalAmount}</red></b> damage.`;

            if (damage.metadata.critical) {
                buf += ' <red><b>(Critical)</b></red>';
            }

            sayAt(player, buf);

            if (player.party) {
                // show damage to party members
                for (const member of player.party) {
                    if (!(member === player || member.room !== player.room)) {
                        buf = '';

                        if (damage.attacker) {
                            buf = `<b>${damage.attacker.name}</b>`;
                        }

                        if (damage.source !== damage.attacker) {
                            buf += `${damage.attacker ? "'s " : ' '}<b>${damage.source.name}</b>`;
                        }
                        else if (!damage.attacker) {
                            buf += 'Something';
                        }

                        /* eslint-disable-next-line max-len */
                        buf += ` hit <b>${player.name}</b> for <b><red>${finalAmount}</red></b> damage`;
                        sayAt(member, buf);
                    }
                }
            }

            if (player.getAttribute('hp') <= 0) {
                state.combat.handleDeath(state, player, damage.attacker);
            }
        };
    },
};

export default evt;
