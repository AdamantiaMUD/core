import Broadcast from '../../../lib/communication/broadcast';
import {CharacterHealEvent} from '../../../lib/characters/events';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterHealPayload} from '../../../lib/characters/events';
import {hasValue} from '../../../lib/util/functions';

const {sayAt} = Broadcast;

export const evt: MudEventListenerDefinition<[Player, CharacterHealPayload]> = {
    name: CharacterHealEvent.getName(),
    listener: (): MudEventListener<[Player, CharacterHealPayload]> => (
        player: Player,
        {source, target, amount}: CharacterHealPayload
    ): void => {
        if (source.metadata.hidden as boolean) {
            return;
        }

        if (target !== player) {
            let playerMessage = '';

            if (source.source === player || !hasValue(source.source)) {
                playerMessage = 'You heal ';
            }
            else {
                playerMessage = `Your {bold ${source.source.name}} healed `;
            }

            playerMessage += `{bold ${target.name}} for {green.bold ${amount}} ${source.attribute}.`;

            sayAt(player, playerMessage);
        }

        // show heals to party members
        if (!hasValue(player.party)) {
            return;
        }

        let partyMessage = '';

        if (source.source === player || !hasValue(source.source)) {
            partyMessage = `${player.name} healed `;
        }
        else {
            partyMessage = `${player.name}'s {bold ${source.source.name}} healed `;
        }

        partyMessage += `{bold ${target.name}} for {green.bold ${amount}} ${source.attribute}.`;

        for (const member of player.party) {
            if (!(member === player || member.room !== player.room)) {
                sayAt(member, partyMessage);
            }
        }
    },
};

export default evt;
