import Broadcast from '../../../lib/communication/broadcast';
import {CharacterDamagedEvent} from '../../../lib/characters/events';
import {hasValue} from '../../../lib/util/functions';

import type Damage from '../../../lib/combat/damage';
import type GameStateData from '../../../lib/game-state-data';
import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterDamagedPayload} from '../../../lib/characters/events';

const {sayAt} = Broadcast;

const getSourceName = (source: Damage): string => {
    let buf = '';

    if (hasValue(source.attacker)) {
        buf = `<b>${source.attacker.name}</b>`;

        if (hasValue(source.source) && source.source !== source.attacker) {
            buf += "'s ";
        }
    }

    if (hasValue(source.source)) {
        buf += `<b>${source.source.name}</b>`;
    }
    else if (!hasValue(source.attacker)) {
        buf += 'Something';
    }

    return buf;
};

export const evt: MudEventListenerDefinition<[Player, CharacterDamagedPayload]> = {
    name: CharacterDamagedEvent.getName(),
    listener: (state: GameStateData): MudEventListener<[Player, CharacterDamagedPayload]> => (
        player: Player,
        {source, amount}: CharacterDamagedPayload
    ): void => {
        if (source.metadata.hidden as boolean || source.attribute !== 'hp') {
            return;
        }

        const sourceName = getSourceName(source);

        let playerMessage = `${sourceName} hit <b>you</b> for <b><red>${amount}</red></b> damage.`;

        if (source.metadata.critical as boolean) {
            playerMessage += ' <red><b>(Critical)</b></red>';
        }

        sayAt(player, playerMessage);

        if (hasValue(player.party)) {
            const partyMessage = `${sourceName} hit <b>${player.name}</b> for <b><red>${amount}</red></b> damage`;

            // show damage to party members
            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    sayAt(member, partyMessage);
                }
            }
        }

        if (player.getAttribute('hp') <= 0) {
            state.combat?.handleDeath(state, player, source.attacker);
        }
    },
};

export default evt;
