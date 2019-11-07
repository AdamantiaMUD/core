import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CharacterHitEvent, CharacterHitPayload} from '../../../lib/characters/character-events';
import {ItemHitEvent} from '../../../lib/equipment/item-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

const {sayAt} = Broadcast;

/* eslint-disable-next-line arrow-body-style */
export const evt: MudEventListenerFactory<CharacterHitPayload> = {
    name: new CharacterHitEvent().getName(),
    listener: (): MudEventListener<CharacterHitPayload> => {
        return (player: Player, {source, target, amount}) => {
            if (source.metadata.hidden) {
                return;
            }

            let buf = '';

            if (source.source === player) {
                buf = 'You hit';
            }
            else {
                buf = `Your <b>${source.source.name}</b> hit`;
            }

            buf += ` <b>${target.name}</b> for <b>${amount}</b> damage.`;

            if (source.metadata.critical) {
                buf += ' <red><b>(Critical)</b></red>';
            }

            sayAt(player, buf);

            if (player.equipment.has('wield')) {
                player.equipment
                    .get('wield')
                    .dispatch(new ItemHitEvent({amount, source, target}));
            }

            // show damage to party members
            if (!player.party) {
                return;
            }

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    buf = '';

                    if (source.source === player) {
                        buf = `${player.name} hit`;
                    }
                    else {
                        buf = `${player.name} <b>${source.source.name}</b> hit`;
                    }

                    buf += ` <b>${target.name}</b> for <b>${amount}</b> damage.`;
                    sayAt(member, buf);
                }
            }
        };
    },
};

export default evt;
