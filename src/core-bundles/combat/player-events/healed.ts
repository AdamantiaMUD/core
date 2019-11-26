import Broadcast from '../../../lib/communication/broadcast';
import Player from '../../../lib/players/player';
import {CharacterHealedEvent, CharacterHealedPayload} from '../../../lib/characters/character-events';
import {MudEventListener, MudEventListenerFactory} from '../../../lib/events/mud-event';

const {sayAt} = Broadcast;

export const evt: MudEventListenerFactory<CharacterHealedPayload> = {
    name: CharacterHealedEvent.getName(),
    listener: (): MudEventListener<CharacterHealedPayload> => (player: Player, {source, amount}) => {
        if (source.metadata.hidden) {
            return;
        }

        let buf = '',
            attacker = '',
            sourceName = '';

        if (source.attacker && source.attacker !== player) {
            attacker = `<b>${source.attacker.name}</b> `;
        }

        if (source.source !== source.attacker) {
            attacker = attacker ? `${attacker}'s ` : '';
            sourceName = `<b>${source.source.name}</b>`;
        }
        else if (!source.attacker) {
            sourceName = 'Something';
        }

        if (source.attribute === 'hp') {
            buf = `${attacker}${sourceName} heals you for <b><red>${amount}</red></b>.`;
        }
        else {
            buf = `${attacker}${sourceName} restores <b>${amount}</b> ${source.attribute}.`;
        }
        sayAt(player, buf);

        // show heal to party members only if it's to hp and not restoring a different pool
        if (!player.party || source.attribute !== 'hp') {
            return;
        }

        for (const member of player.party) {
            if (!(member === player || member.room !== player.room)) {
                /* eslint-disable-next-line max-len */
                buf = `${attacker}${sourceName} heals ${player.name} for <b><red>${amount}</red></b>.`;

                sayAt(member, buf);
            }
        }
    },
};

export default evt;
