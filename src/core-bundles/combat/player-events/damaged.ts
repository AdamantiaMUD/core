import Broadcast from '../../../lib/communication/broadcast';
import GameState from '../../../lib/game-state';
import Player from '../../../lib/players/player';
import {CharacterDamagedEvent, CharacterDamagedPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<CharacterDamagedPayload> = {
    name: CharacterDamagedEvent.getName(),
    listener: (state: GameState): MudEventListener<CharacterDamagedPayload> => {
        return (player: Player, {source, amount}) => {
            if (source.metadata.hidden || source.attribute !== 'hp') {
                return;
            }

            let buf = '';

            if (source.attacker) {
                buf = `<b>${source.attacker.name}</b>`;
            }

            if (source.source !== source.attacker) {
                buf += `${source.attacker ? "'s " : ' '}<b>${source.source.name}</b>`;
            }
            else if (!source.attacker) {
                buf += 'Something';
            }

            buf += ` hit <b>you</b> for <b><red>${amount}</red></b> damage.`;

            if (source.metadata.critical) {
                buf += ' <red><b>(Critical)</b></red>';
            }

            sayAt(player, buf);

            if (player.party) {
                // show damage to party members
                for (const member of player.party) {
                    if (!(member === player || member.room !== player.room)) {
                        buf = '';

                        if (source.attacker) {
                            buf = `<b>${source.attacker.name}</b>`;
                        }

                        if (source.source !== source.attacker) {
                            buf += `${source.attacker ? "'s " : ' '}<b>${source.source.name}</b>`;
                        }
                        else if (!source.attacker) {
                            buf += 'Something';
                        }

                        /* eslint-disable-next-line max-len */
                        buf += ` hit <b>${player.name}</b> for <b><red>${amount}</red></b> damage`;
                        sayAt(member, buf);
                    }
                }
            }

            if (player.getAttribute('hp') <= 0) {
                state.combat.handleDeath(state, player, source.attacker);
            }
        };
    },
};

export default evt;
