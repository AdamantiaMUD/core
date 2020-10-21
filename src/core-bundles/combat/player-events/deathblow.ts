import Broadcast from '../../../lib/communication/broadcast';
import LevelUtil from '../../../lib/util/level-util';
import {CharacterDeathblowEvent} from '../../../lib/characters/events';
import {PlayerExperienceEvent} from '../../../lib/players/events';
import {hasValue} from '../../../lib/util/functions';
import {isNpc} from '../../../lib/util/characters';

import type MudEventListener from '../../../lib/events/mud-event-listener';
import type MudEventListenerDefinition from '../../../lib/events/mud-event-listener-definition';
import type Player from '../../../lib/players/player';
import type {CharacterDeathblowPayload} from '../../../lib/characters/events';

const {sayAt} = Broadcast;

export const evt: MudEventListenerDefinition<[Player, CharacterDeathblowPayload]> = {
    name: CharacterDeathblowEvent.getName(),
    listener: (): MudEventListener<[Player, CharacterDeathblowPayload]> => (
        player: Player,
        payload: CharacterDeathblowPayload,
    ): void => {
        const {target, shouldSkipParty = false} = payload;

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
                    member.dispatch(new CharacterDeathblowEvent({shouldSkipParty: true, target: target}));
                }
            }

            return;
        }

        if (hasValue(target) && !isNpc(player)) {
            sayAt(player, `{red.bold You killed ${target.name}!}`);
        }

        player.dispatch(new PlayerExperienceEvent({amount: xp}));
    },
};

export default evt;
