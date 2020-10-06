import {CharacterHitEvent} from '../../../lib/characters/events';
import {ItemHitEvent} from '../../../lib/equipment/events';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterHitPayload} from '../../../lib/characters/events';

export const evt: MudEventListenerDefinition<[Player, CharacterHitPayload]> = {
    name: CharacterHitEvent.getName(),
    listener: (): MudEventListener<[Player, CharacterHitPayload]> => (
        player: Player,
        {source, target, amount}: CharacterHitPayload
    ): void => {
        if (source.metadata.hidden as boolean) {
            return;
        }

        let playerMessage;

        if (source.source === player || !hasValue(source.source)) {
            playerMessage = 'You ';
        }
        else {
            playerMessage = `Your <b>${source.source.name}</b> `;
        }

        playerMessage += `hit <b>${target.name}</b> for <b>${amount}</b> damage.`;

        if (source.metadata.critical as boolean) {
            playerMessage += ' <red><b>(Critical)</b></red>';
        }

        sayAt(player, playerMessage);

        const wielded = player.equipment.get('wield');

        if (hasValue(wielded)) {
            wielded.dispatch(new ItemHitEvent({amount, source, target}));
        }

        // show damage to party members
        if (!hasValue(player.party)) {
            return;
        }

        let partyMessage;

        if (source.source === player || !hasValue(source.source)) {
            partyMessage = `${player.name} hit `;
        }
        else {
            partyMessage = `${player.name}'s <b>${source.source.name}</b> hit `;
        }

        partyMessage += `<b>${target.name}</b> for <b>${amount}</b> damage.`;

        for (const member of player.party) {
            if (!(member === player || member.room !== player.room)) {
                sayAt(member, partyMessage);
            }
        }
    },
};

export default evt;
