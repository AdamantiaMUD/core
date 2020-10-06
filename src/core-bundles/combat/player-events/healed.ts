import {CharacterHealedEvent} from '../../../lib/characters/events';
import {hasValue} from '../../../lib/util/functions';
import {sayAt} from '../../../lib/communication/broadcast';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterHealedPayload} from '../../../lib/characters/events';

export const evt: MudEventListenerDefinition<[Player, CharacterHealedPayload]> = {
    name: CharacterHealedEvent.getName(),
    listener: (): MudEventListener<[Player, CharacterHealedPayload]> => (
        player: Player,
        {source, amount}: CharacterHealedPayload
    ): void => {
        if (source.metadata.hidden as boolean) {
            return;
        }

        let playerMessage,
            attacker = '',
            sourceName = '';

        if (hasValue(source.attacker) && source.attacker !== player) {
            attacker = `<b>${source.attacker.name}</b> `;
        }

        if (hasValue(source.source) && source.source !== source.attacker) {
            attacker = attacker.length > 0 ? `${attacker}'s ` : '';
            sourceName = `<b>${source.source.name}</b>`;
        }
        else if (!hasValue(source.attacker)) {
            sourceName = 'Something';
        }

        if (source.attribute === 'hp') {
            playerMessage = `${attacker}${sourceName} heals you for <b><red>${amount}</red></b>.`;
        }
        else {
            playerMessage = `${attacker}${sourceName} restores <b>${amount}</b> ${source.attribute}.`;
        }

        sayAt(player, playerMessage);

        // show heal to party members only if it's to hp and not restoring a different pool
        if (!hasValue(player.party) || source.attribute !== 'hp') {
            return;
        }

        const partyMessage = `${attacker}${sourceName} heals ${player.name} for <b><red>${amount}</red></b>.`;

        for (const member of player.party) {
            if (member !== player && member.room === player.room) {
                sayAt(member, partyMessage);
            }
        }
    },
};

export default evt;
