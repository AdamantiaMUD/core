import { CharacterHitEvent } from '../../../lib/characters/events/index.js';
import { ItemHitEvent } from '../../../lib/equipment/events/index.js';
import { hasValue } from '../../../lib/util/functions.js';
import { sayAt } from '../../../lib/communication/broadcast.js';

import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type Player from '../../../lib/players/player.js';
import type { CharacterHitPayload } from '../../../lib/characters/events/index.js';

export const evt: MudEventListenerDefinition<[Player, CharacterHitPayload]> = {
    name: CharacterHitEvent.getName(),
    listener:
        (): MudEventListener<[Player, CharacterHitPayload]> =>
        (
            player: Player,
            { source, target, amount }: CharacterHitPayload
        ): void => {
            if (source.metadata.hidden as boolean) {
                return;
            }

            let playerMessage;

            if (source.source === player || !hasValue(source.source)) {
                playerMessage = 'You ';
            } else {
                playerMessage = `Your {bold ${source.source.name}} `;
            }

            playerMessage += `hit {bold ${target.name}} for {bold ${amount}} damage.`;

            if (source.metadata.critical as boolean) {
                playerMessage += ' {red.bold (Critical)}';
            }

            sayAt(player, playerMessage);

            const wielded = player.equipment.get('wield');

            if (hasValue(wielded)) {
                wielded.dispatch(new ItemHitEvent({ amount, source, target }));
            }

            // show damage to party members
            if (!hasValue(player.party)) {
                return;
            }

            let partyMessage;

            if (source.source === player || !hasValue(source.source)) {
                partyMessage = `${player.name} hit `;
            } else {
                partyMessage = `${player.name}'s {bold ${source.source.name}} hit `;
            }

            partyMessage += `{bold ${target.name}} for {bold ${amount}} damage.`;

            for (const member of player.party) {
                if (!(member === player || member.room !== player.room)) {
                    sayAt(member, partyMessage);
                }
            }
        },
};

export default evt;
