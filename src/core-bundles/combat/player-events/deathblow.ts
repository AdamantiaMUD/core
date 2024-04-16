import Broadcast from '../../../lib/communication/broadcast.js';
import LevelUtil from '../../../lib/util/level-util.js';
import { CharacterDeathblowEvent } from '../../../lib/characters/events/index.js';
import { PlayerExperienceEvent } from '../../../lib/players/events/index.js';
import { hasValue } from '../../../lib/util/functions.js';
import { isNpc } from '../../../lib/util/characters.js';

import type MudEventListener from '../../../lib/events/mud-event-listener.js';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition.js';
import type Player from '../../../lib/players/player.js';
import type { CharacterDeathblowPayload } from '../../../lib/characters/events/index.js';

const { sayAt } = Broadcast;

export const evt: MudEventListenerDefinition<
    [Player, CharacterDeathblowPayload]
> = {
    name: CharacterDeathblowEvent.getName(),
    listener:
        (): MudEventListener<[Player, CharacterDeathblowPayload]> =>
        (player: Player, payload: CharacterDeathblowPayload): void => {
            const { target, shouldSkipParty = false } = payload;

            /* eslint-disable-next-line id-length */
            const xp = LevelUtil.mobExp(target.level);

            if (hasValue(player.party) && !shouldSkipParty) {
                /*
                 * If they're in a party, proxy the deathblow to all members of
                 * the party in the same room. this will make sure party members
                 * get quest credit trigger anything else listening for
                 * deathblow
                 */
                for (const member of player.party) {
                    if (member.room === player.room) {
                        member.dispatch(
                            new CharacterDeathblowEvent({
                                shouldSkipParty: true,
                                target: target,
                            })
                        );
                    }
                }

                return;
            }

            if (hasValue(target) && !isNpc(player)) {
                sayAt(player, `{red.bold You killed ${target.name}!}`);
            }

            player.dispatch(new PlayerExperienceEvent({ amount: xp }));
        },
};

export default evt;
