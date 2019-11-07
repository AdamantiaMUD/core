import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CharacterHealEvent, CharacterHealPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerFactory<CharacterHealPayload> = {
    name: new CharacterHealEvent().getName(),
    listener: (): MudEventListener<CharacterHealPayload> => {
        return (player: Player, {source, target, amount}) => {
            if (source.metadata.hidden) {
                return;
            }

            if (target !== player) {
                let buf = '';

                if (source.source === player) {
                    buf = 'You heal';
                }
                else {
                    buf = `Your <b>${source.source.name}</b> healed`;
                }

                /* eslint-disable-next-line max-len */
                buf += `<b> ${target.name}</b> for <b><green>${amount}</green></b> ${source.attribute}.`;
                sayAt(player, buf);
            }

            // show heals to party members
            if (!player.party) {
                return;
            }

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    let buf = '';

                    if (source.source === player) {
                        buf = `${player.name} healed`;
                    }
                    else {
                        buf = `${player.name} <b>${source.source.name}</b> healed`;
                    }

                    buf += ` <b>${target.name}</b>`;
                    buf += ` for <b><green>${amount}</green></b> ${source.attribute}.`;
                    sayAt(member, buf);
                }
            }
        };
    },
};

export default evt;
